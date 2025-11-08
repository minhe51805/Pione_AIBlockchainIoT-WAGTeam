const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /api/auth/register - Register new user with auto-generated wallet
router.post('/register', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`\n🔐 [${timestamp}] REGISTER REQUEST`);

  try {
    const {
      full_name,
      email,
      pin,
      passkey_credential_id,
      passkey_public_key,
      wallet_address,
      wallet_private_key,
      wallet_mnemonic
    } = req.body;

    console.log('📋 Registration data received:');
    console.log(`   • Full name: ${full_name}`);
    console.log(`   • Email: ${email}`);
    console.log(`   • PIN: ${pin ? '****' : 'not provided'} (not stored in DB)`);
    console.log(`   • Credential ID: ${passkey_credential_id ? passkey_credential_id.substring(0, 20) + '...' : 'not provided'}`);
    console.log(`   • Wallet Address: ${wallet_address}`);
    console.log(`   • Private Key: ${wallet_private_key ? '[REDACTED - kept in browser only]' : 'not provided'}`);
    console.log(`   • Mnemonic: ${wallet_mnemonic ? '[REDACTED - kept in browser only]' : 'not provided'}`);

    // Validate required fields
    if (!full_name || !email || !wallet_address) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['full_name', 'email', 'wallet_address']
      });
    }

    // Check if user already exists
    console.log('🔍 Checking if user already exists...');
    const checkQuery = 'SELECT id FROM users WHERE email = $1 OR wallet_address = $2';
    const checkResult = await pool.query(checkQuery, [email, wallet_address]);

    if (checkResult.rows.length > 0) {
      console.log('❌ User already exists');
      return res.status(409).json({
        error: 'User already exists',
        message: 'Email or wallet address already registered'
      });
    }

    console.log('✅ User does not exist, proceeding with registration...');

    // Insert new user (SECURITY: Never store private keys or mnemonic in database!)
    const insertQuery = `
      INSERT INTO users (
        full_name,
        email,
        passkey_credential_id,
        passkey_public_key,
        wallet_address,
        created_at_vn,
        updated_at_vn,
        passkey_created_at_vn
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())
      RETURNING id, full_name, email, wallet_address, created_at_vn as created_at
    `;

    const values = [
      full_name,
      email,
      passkey_credential_id || `mock_${Date.now()}`,
      passkey_public_key || `mock_pubkey_${Date.now()}`,
      wallet_address
    ];

    console.log('💾 Inserting user into database...');
    const result = await pool.query(insertQuery, values);
    const user = result.rows[0];

    console.log('✅ User registered successfully!');
    console.log(`   • User ID: ${user.id}`);
    console.log(`   • Created at: ${user.created_at}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        wallet_address: user.wallet_address,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('   Error details:', error.message);

    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// POST /api/auth/login - Login with passkey credential
router.post('/login', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`\n🔓 [${timestamp}] LOGIN REQUEST`);

  try {
    const { credential_id, wallet_address } = req.body;

    console.log('📋 Login data:');
    console.log(`   • Credential ID: ${credential_id ? credential_id.substring(0, 20) + '...' : 'not provided'}`);
    console.log(`   • Wallet: ${wallet_address}`);

    if (!wallet_address) {
      console.log('❌ Validation failed: Missing wallet_address');
      return res.status(400).json({
        error: 'Missing required field: wallet_address'
      });
    }

    console.log('🔍 Looking up user...');
    const query = `
      SELECT 
        id, 
        full_name, 
        email, 
        wallet_address,
        passkey_credential_id,
        passkey_public_key,
        farm_name,
        farm_location,
        created_at
      FROM users 
      WHERE wallet_address = $1
    `;

    const result = await pool.query(query, [wallet_address]);

    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return res.status(404).json({
        error: 'User not found',
        message: 'No user with this wallet address'
      });
    }

    const user = result.rows[0];
    console.log('✅ User found!');
    console.log(`   • User ID: ${user.id}`);
    console.log(`   • Name: ${user.full_name}`);

    res.json({
      success: true,
      message: 'Login successful',
      user
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('   Error details:', error.message);

    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

// GET /api/auth/user/:id - Get user by ID or wallet address
router.get('/user/:id', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`\n👤 [${timestamp}] GET USER REQUEST`);

  try {
    const { id } = req.params;
    console.log(`   • Looking up: ${id}`);

    // Check if ID is numeric (database ID) or hex (wallet address)
    const isWalletAddress = id.startsWith('0x');

    const query = isWalletAddress
      ? 'SELECT * FROM users WHERE wallet_address = $1'
      : 'SELECT * FROM users WHERE id = $1';

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const user = result.rows[0];
    console.log('✅ User found!');
    console.log(`   • ID: ${user.id}`);
    console.log(`   • Name: ${user.full_name}`);

    // Remove sensitive data
    delete user.wallet_private_key;
    delete user.wallet_mnemonic;
    delete user.pin_code;

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('❌ Get user error:', error);
    console.error('   Error details:', error.message);

    res.status(500).json({
      error: 'Failed to get user',
      message: error.message
    });
  }
});

module.exports = router;
