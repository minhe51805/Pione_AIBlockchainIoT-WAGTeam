# Security Policy

## 🛡️ Security Overview

GAIA.VN takes security seriously. This document outlines our security policy, reporting procedures, and best practices for maintaining a secure agricultural IoT system.

## 📋 Table of Contents

- [Supported Versions](#supported-versions)
- [Reporting Security Vulnerabilities](#reporting-security-vulnerabilities)
- [Security Best Practices](#security-best-practices)
- [Known Security Considerations](#known-security-considerations)
- [Security Updates](#security-updates)

## Supported Versions

We actively maintain security updates for the following versions:

| Version | Supported |
| ------- | --------- |
| 1.0.x   | ✅ Yes    |
| < 1.0   | ❌ No     |

## Reporting Security Vulnerabilities

### 🚨 Please DO NOT report security vulnerabilities through public GitHub issues.

If you discover a security vulnerability, please report it privately:

### Preferred Method: Email

- **Email**: security@gaia.vn
- **Subject**: [SECURITY] Brief description of the vulnerability
- **GPG Key**: Available upon request for encrypted communication

### What to Include:

1. **Detailed Description**: Clear explanation of the vulnerability
2. **Steps to Reproduce**: Step-by-step instructions
3. **Impact Assessment**: Potential security impact and affected components
4. **Proof of Concept**: Code snippets or screenshots (if applicable)
5. **Suggested Fix**: If you have ideas for remediation
6. **Your Contact Information**: For follow-up questions

### Example Report:

```
Subject: [SECURITY] SQL Injection in sensor data endpoint

Description:
The /api/data endpoint appears vulnerable to SQL injection attacks
through the 'timestamp' parameter.

Steps to Reproduce:
1. Send POST request to /api/data
2. Include malicious SQL in timestamp field
3. Observe database error messages

Impact:
- Potential unauthorized data access
- Database manipulation possible
- Affects: Flask API (app_ingest.py)

Affected Versions: 1.0.0 - 1.0.3
```

### Response Timeline:

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Critical issues within 30 days, others within 90 days

## Security Best Practices

### 🔐 Environment Configuration

#### Never Commit Sensitive Data

```bash
# ❌ NEVER commit these files:
.env
config.env
*.key
*.pem

# ✅ Always use .env.example templates
cp .env.example .env
# Then edit .env with your actual values
```

#### Secure Environment Variables

```env
# Use strong, unique values for production
PRIVATE_KEY=0x1234567890abcdef...  # 64 hex characters
PGPASSWORD=SuperSecurePassword123!  # Strong password
GEMINI_API_KEY=AIzaSy...           # Never share API keys
```

### 🌐 Network Security

#### API Endpoints

- Always use HTTPS in production
- Implement rate limiting
- Validate all input parameters
- Use CORS appropriately

#### Database Security

```sql
-- Use dedicated database user with limited permissions
CREATE USER gaia_app WITH PASSWORD 'strong_password';
GRANT SELECT, INSERT, UPDATE ON sensor_data TO gaia_app;
-- DON'T grant DROP, CREATE, or admin privileges
```

#### Blockchain Security

- Use hardware wallets for mainnet deployments
- Implement multi-signature for critical operations
- Audit smart contracts before mainnet deployment
- Monitor gas prices to prevent DoS attacks

### 🔒 Authentication & Authorization

#### Passkey Security (WebAuthn)

- Store credentials securely
- Implement proper challenge-response
- Use HTTPS for all auth endpoints
- Validate attestation and assertion

#### API Security

```javascript
// Always validate and sanitize inputs
const validateSensorData = (data) => {
  if (!data.temperature || typeof data.temperature !== "number") {
    throw new Error("Invalid temperature data");
  }
  // Additional validation...
};
```

### 🛡️ IoT Security

#### Device Security

- Use secure communication protocols (HTTPS/WSS)
- Implement device authentication
- Regular firmware updates
- Secure boot process

#### Data Transmission

```cpp
// Arduino secure HTTP client
WiFiClientSecure client;
client.setInsecure(); // Only for development!
// In production, use proper certificate validation
```

## Known Security Considerations

### 🔍 Current Security Measures

#### Implemented:

- ✅ Environment variable protection (.gitignore)
- ✅ Input validation on API endpoints
- ✅ Passkey authentication (WebAuthn)
- ✅ Blockchain data immutability
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ Hash verification for data integrity

#### In Progress:

- 🔄 Rate limiting implementation
- 🔄 API key authentication for IoT devices
- 🔄 Smart contract audit
- 🔄 Penetration testing

#### Planned:

- 📋 OAuth2/JWT implementation
- 📋 Two-factor authentication
- 📋 Advanced monitoring and alerting
- 📋 Encryption at rest

### ⚠️ Security Limitations

1. **Development Environment**:

   - Default credentials in examples
   - HTTP allowed in development
   - Relaxed CORS settings

2. **IoT Devices**:

   - Limited encryption capabilities on ESP8266/ESP32
   - Physical access vulnerabilities
   - Firmware update mechanisms

3. **Blockchain**:
   - Gas price volatility
   - Smart contract immutability risks
   - Private key management

## Security Updates

### 🔔 Notification Channels

- **GitHub Security Advisories**: High-priority vulnerabilities
- **Release Notes**: Security fixes included in versions
- **Email Updates**: Subscribe to security@gaia.vn
- **Discord/Slack**: Community notifications (coming soon)

### 📦 Update Process

#### For Users:

```bash
# Always backup before updating
npm audit                    # Check for vulnerabilities
pip check                   # Check Python packages
git pull origin main        # Get latest security fixes
npm install                 # Update dependencies
pip install -r requirements.txt --upgrade
```

#### For Contributors:

```bash
# Regular security checks
npm audit fix               # Fix npm vulnerabilities
pip-audit                   # Check Python vulnerabilities
bandit -r .                 # Security linter for Python
semgrep --config=auto .     # Static analysis
```

### 🚨 Emergency Procedures

In case of critical security issues:

1. **Immediate Actions**:

   - Take affected systems offline if necessary
   - Rotate all API keys and passwords
   - Check access logs for unauthorized activity

2. **Communication**:

   - Emergency contact: security@gaia.vn
   - Status updates on GitHub
   - User notification through all channels

3. **Recovery**:
   - Apply security patches immediately
   - Conduct post-incident analysis
   - Update security procedures

## Responsible Disclosure

We follow responsible disclosure practices:

1. **Coordination**: We work with security researchers
2. **Credit**: Public acknowledgment for valid reports (with permission)
3. **Timeline**: Reasonable time for fixes before public disclosure
4. **No Retaliation**: No legal action against good-faith security research

### Hall of Fame 🏆

We thank these security researchers for their contributions:

- _Your name could be here!_

## Security Resources

### 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Python Security](https://python-security.readthedocs.io/)
- [Smart Contract Security](https://consensys.github.io/smart-contract-best-practices/)
- [IoT Security Guidelines](https://www.nist.gov/cybersecurity/iot)

### 🛠️ Security Tools

- **SAST**: Semgrep, Bandit, ESLint Security
- **Dependency Scanning**: npm audit, pip-audit, Snyk
- **Smart Contract**: MythX, Slither, Echidna
- **Infrastructure**: Nessus, OpenVAS, Nmap

---

## Contact Information

**Security Team**: security@gaia.vn  
**Project Lead**: [@minhe51805](https://github.com/minhe51805)  
**General Contact**: contact@gaia.vn

**PGP Key**: Available upon request for secure communication

---

_Last Updated: November 10, 2025_  
_Next Review: February 10, 2026_
