"""
Authentication Routes - Passkey-based Authentication for Farmers
Handles: Registration, Login, Profile Management
"""

from flask import Blueprint, request, jsonify
import psycopg2
import os
from datetime import datetime
from dotenv import load_dotenv
import hashlib

load_dotenv('.env')

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Database connection helper
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('PGHOST'),
        port=os.getenv('PGPORT'),
        database=os.getenv('PGDATABASE'),
        user=os.getenv('PGUSER'),
        password=os.getenv('PGPASSWORD')
    )

# Generate deterministic wallet address from passkey credential
def generate_wallet_address(credential_id: str) -> str:
    """
    Generate deterministic wallet address from Passkey credential ID
    Uses Ethereum address format (0x + 40 hex chars)
    """
    # Hash credential_id to create deterministic address
    hash_result = hashlib.sha256(f"aquamind_wallet_{credential_id}".encode()).hexdigest()
    # Take first 40 chars and format as Ethereum address
    return f"0x{hash_result[:40]}"


@auth_bp.route('/register-passkey', methods=['POST'])
def register_passkey():
    """
    Register new user with Passkey
    
    Request body:
    {
        "full_name": "Nguyen Van A",
        "phone": "0912345678",
        "email": "optional@email.com",
        "farm_name": "Nong trai Van A",
        "farm_location_lat": 10.762622,
        "farm_location_lon": 106.660172,
        "farm_area_hectares": 2.5,
        "current_crop": "coffee",
        "passkey_credential_id": "ABC123...",
        "passkey_public_key": "MII...",
        "passkey_transports": ["internal", "hybrid"]
    }
    
    Returns:
    {
        "success": true,
        "user_id": 1,
        "wallet_address": "0x...",
        "message": "Đăng ký thành công!"
    }
    """
    try:
        data = request.json
        
        # Validate required fields
        required = ['full_name', 'phone', 'passkey_credential_id', 'passkey_public_key']
        for field in required:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'Thiếu trường bắt buộc: {field}'
                }), 400
        
        # Generate wallet address from passkey credential
        wallet_address = generate_wallet_address(data['passkey_credential_id'])
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if phone already exists
        cur.execute("SELECT id FROM users WHERE phone = %s", (data['phone'],))
        existing = cur.fetchone()
        if existing:
            cur.close()
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Số điện thoại đã được đăng ký'
            }), 400
        
        # Check if passkey credential already exists
        cur.execute(
            "SELECT id FROM users WHERE passkey_credential_id = %s", 
            (data['passkey_credential_id'],)
        )
        existing_passkey = cur.fetchone()
        if existing_passkey:
            cur.close()
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Passkey này đã được đăng ký'
            }), 400
        
        # Insert new user
        insert_query = """
            INSERT INTO users (
                full_name, phone, email,
                passkey_credential_id, passkey_public_key, passkey_counter, passkey_transports,
                passkey_created_at_vn,
                wallet_address, wallet_created_at_vn,
                farm_name, farm_location_lat, farm_location_lon, farm_area_hectares, current_crop,
                is_active, created_at_vn, updated_at_vn, last_login_at_vn
            ) VALUES (
                %s, %s, %s,
                %s, %s, %s, %s,
                NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh',
                %s, NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh',
                %s, %s, %s, %s, %s,
                TRUE, NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh', NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh', NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'
            )
            RETURNING id, wallet_address
        """
        
        cur.execute(insert_query, (
            data['full_name'],
            data['phone'],
            data.get('email'),
            data['passkey_credential_id'],
            data['passkey_public_key'],
            0,  # Initial counter
            data.get('passkey_transports', []),
            wallet_address,
            data.get('farm_name'),
            data.get('farm_location_lat'),
            data.get('farm_location_lon'),
            data.get('farm_area_hectares'),
            data.get('current_crop')
        ))
        
        user_id, wallet_addr = cur.fetchone()
        conn.commit()
        
        cur.close()
        conn.close()
        
        print(f"✅ New user registered: {data['full_name']} (ID: {user_id}, Wallet: {wallet_addr})")
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'wallet_address': wallet_addr,
            'message': f'Đăng ký thành công! Ví của bạn: {wallet_addr}'
        }), 201
        
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_bp.route('/login-passkey', methods=['POST'])
def login_passkey():
    """
    Login with Passkey
    
    Request body:
    {
        "passkey_credential_id": "ABC123..."
    }
    
    Returns:
    {
        "success": true,
        "user": {
            "id": 1,
            "full_name": "Nguyen Van A",
            "phone": "0912345678",
            "wallet_address": "0x...",
            "farm_name": "Nong trai Van A",
            "current_crop": "coffee",
            ...
        }
    }
    """
    try:
        data = request.json
        credential_id = data.get('passkey_credential_id')
        
        if not credential_id:
            return jsonify({
                'success': False,
                'error': 'Thiếu passkey_credential_id'
            }), 400
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Find user by credential_id
        cur.execute("""
            SELECT 
                id, full_name, phone, email,
                wallet_address,
                farm_name, farm_location_lat, farm_location_lon, farm_area_hectares, current_crop,
                passkey_counter,
                is_active
            FROM users
            WHERE passkey_credential_id = %s
        """, (credential_id,))
        
        user_row = cur.fetchone()
        
        if not user_row:
            cur.close()
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Không tìm thấy tài khoản với Passkey này'
            }), 404
        
        # Check if active
        if not user_row[11]:  # is_active
            cur.close()
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Tài khoản đã bị vô hiệu hóa'
            }), 403
        
        # Update last login and counter
        new_counter = user_row[10] + 1
        cur.execute("""
            UPDATE users
            SET last_login_at_vn = NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh',
                passkey_last_used_at_vn = NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh',
                passkey_counter = %s,
                updated_at_vn = NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'
            WHERE id = %s
        """, (new_counter, user_row[0]))
        
        conn.commit()
        cur.close()
        conn.close()
        
        # Build user object
        user = {
            'id': user_row[0],
            'full_name': user_row[1],
            'phone': user_row[2],
            'email': user_row[3],
            'wallet_address': user_row[4],
            'farm_name': user_row[5],
            'farm_location_lat': user_row[6],
            'farm_location_lon': user_row[7],
            'farm_area_hectares': user_row[8],
            'current_crop': user_row[9],
        }
        
        print(f"✅ User logged in: {user['full_name']} (ID: {user['id']})")
        
        return jsonify({
            'success': True,
            'user': user,
            'message': f'Chào mừng {user["full_name"]}!'
        }), 200
        
    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_bp.route('/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    """Get user profile by ID"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                id, full_name, phone, email,
                wallet_address, wallet_created_at_vn,
                farm_name, farm_location_lat, farm_location_lon, farm_area_hectares, current_crop,
                created_at_vn, last_login_at_vn
            FROM users
            WHERE id = %s AND is_active = TRUE
        """, (user_id,))
        
        row = cur.fetchone()
        cur.close()
        conn.close()
        
        if not row:
            return jsonify({
                'success': False,
                'error': 'Không tìm thấy người dùng'
            }), 404
        
        user = {
            'id': row[0],
            'full_name': row[1],
            'phone': row[2],
            'email': row[3],
            'wallet_address': row[4],
            'wallet_created_at': row[5].isoformat() if row[5] else None,
            'farm_name': row[6],
            'farm_location_lat': row[7],
            'farm_location_lon': row[8],
            'farm_area_hectares': row[9],
            'current_crop': row[10],
            'created_at': row[11].isoformat() if row[11] else None,
            'last_login_at': row[12].isoformat() if row[12] else None,
        }
        
        return jsonify({
            'success': True,
            'user': user
        }), 200
        
    except Exception as e:
        print(f"❌ Get profile error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_bp.route('/profile/<int:user_id>', methods=['PUT'])
def update_profile(user_id):
    """Update user profile"""
    try:
        data = request.json
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Build update query dynamically
        allowed_fields = ['full_name', 'email', 'farm_name', 'farm_location_lat', 
                         'farm_location_lon', 'farm_area_hectares', 'current_crop']
        
        updates = []
        values = []
        
        for field in allowed_fields:
            if field in data:
                updates.append(f"{field} = %s")
                values.append(data[field])
        
        if not updates:
            return jsonify({
                'success': False,
                'error': 'Không có trường nào để cập nhật'
            }), 400
        
        # Add updated_at
        updates.append("updated_at_vn = NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'")
        values.append(user_id)
        
        query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s AND is_active = TRUE RETURNING id"
        
        cur.execute(query, values)
        result = cur.fetchone()
        
        if not result:
            cur.close()
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Không tìm thấy người dùng'
            }), 404
        
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"✅ User profile updated: ID {user_id}")
        
        return jsonify({
            'success': True,
            'message': 'Cập nhật thông tin thành công!'
        }), 200
        
    except Exception as e:
        print(f"❌ Update profile error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

