# Contributing to GAIA.VN - Global Agro Intelligence Architecture

First off, thank you for considering contributing to GAIA.VN! 🎉 It's people like you that make GAIA.VN such a great tool for smart agriculture.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by the [GAIA.VN Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues as you might find that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs** if possible
- **Include your environment details** (OS, Node.js version, Python version, etc.)

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and expected behavior**
- **Explain why this enhancement would be useful**

### 🛠️ Code Contributions

#### Areas where contributions are welcome:

- **IoT Integration**: New sensor support, data collection improvements
- **AI/ML Models**: Enhanced prediction algorithms, new crop recommendations
- **Blockchain**: Smart contract optimizations, new network support
- **Frontend**: UI/UX improvements, new dashboard features
- **Backend**: API optimizations, new endpoints
- **Documentation**: Code comments, README updates, tutorials
- **Testing**: Unit tests, integration tests, E2E tests

## Development Setup

### Prerequisites

- **Node.js** >= 18.0.0
- **Python** >= 3.8
- **PostgreSQL** >= 13
- **Git**

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Clone your fork locally
git clone https://github.com/YOUR-USERNAME/Pione_AIBlockchainIoT-WAGTeam.git
cd Pione_AIBlockchainIoT-WAGTeam

# Add upstream remote
git remote add upstream https://github.com/minhe51805/Pione_AIBlockchainIoT-WAGTeam.git
```

### 2. Environment Setup

#### Database Setup

```bash
# Create PostgreSQL database
createdb db_iot_sensor

# Import schema
psql -d db_iot_sensor < db.sql

# Run migrations
psql -d db_iot_sensor < migrations/008_add_users_table.sql
psql -d db_iot_sensor < migrations/009_add_pin_hash_column.sql
psql -d db_iot_sensor < migrations/010_fix_nullable_passkey.sql
```

#### Backend Services

```bash
# Install root dependencies
pip install -r requirements.txt
npm install

# AI Service
cd ai/ai_service
pip install -r requirements.txt
cp config.env.example config.env
# Edit config.env with your settings

# DApp Backend
cd ../../Dapp/backend
npm install
cp .env.example .env
# Edit .env with your settings

# DApp Frontend
cd ../frontend
npm install
cp env.local.example .env.local
# Edit .env.local with your settings

# Blockchain
cd ../../blockchain
npm install
```

#### Environment Files

Create and configure these files with your local settings:

- `.env` (root)
- `ai/ai_service/config.env`
- `Dapp/backend/.env`
- `Dapp/frontend/.env.local`

### 3. Running the Development Environment

```bash
# Terminal 1: Flask API
python app_ingest.py

# Terminal 2: Blockchain Bridge
node server.js

# Terminal 3: AI Service
cd ai/ai_service
uvicorn main:app --reload --port 8000

# Terminal 4: Backend API
cd Dapp/backend
npm run dev

# Terminal 5: Frontend DApp
cd Dapp/frontend
npm run dev
```

## Pull Request Process

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Write clean, readable code
- Add comments for complex logic
- Include tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run Python tests
pytest tests/

# Run JavaScript tests
npm test

# Test manually with curl or Postman
curl -X POST http://localhost:5000/api/data \
  -H "Content-Type: application/json" \
  -d @test_data.json
```

### 4. Commit Your Changes

Follow our [commit message guidelines](#commit-message-guidelines)

```bash
git add .
git commit -m "feat: add new sensor support for soil pH"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:

- Clear title and description
- Reference any related issues
- Include screenshots for UI changes
- List any breaking changes

### 6. Pull Request Review

- Address any feedback from reviewers
- Keep your branch up to date with main
- Ensure CI checks pass

```bash
# Update your branch
git fetch upstream
git rebase upstream/main
```

## Coding Standards

### Python (Flask, FastAPI)

- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/)
- Use type hints where appropriate
- Maximum line length: 88 characters (Black formatter)
- Use docstrings for functions and classes

```python
def process_sensor_data(temperature: float, humidity: float) -> dict:
    """
    Process raw sensor data and return standardized format.

    Args:
        temperature: Soil temperature in Celsius
        humidity: Soil moisture percentage

    Returns:
        Processed sensor data dictionary
    """
    return {"temp": temperature, "humid": humidity}
```

### JavaScript/TypeScript (Node.js, React)

- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use ESLint and Prettier
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable names

```typescript
interface SensorData {
  temperature: number;
  humidity: number;
  timestamp: string;
}

const processSensorReading = async (data: SensorData): Promise<void> => {
  // Implementation
};
```

### Solidity (Smart Contracts)

- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use explicit visibility modifiers
- Add comprehensive comments
- Use meaningful variable names

```solidity
/**
 * @dev Store sensor reading with validation
 * @param _temperature Temperature in Celsius * 10
 * @param _humidity Humidity percentage * 10
 */
function storeSensorReading(
    uint256 _temperature,
    uint256 _humidity
) external onlyAuthorized {
    // Implementation
}
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types:

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system changes
- **ci**: CI/CD changes
- **chore**: Other changes

### Examples:

```
feat(api): add endpoint for soil health analysis
fix(blockchain): resolve gas estimation issue
docs(readme): update installation instructions
test(ai): add unit tests for crop prediction model
```

## Issue Guidelines

### Bug Reports

Use the bug report template and include:

- Environment details (OS, versions)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs if applicable
- Possible solution (if known)

### Feature Requests

Use the feature request template and include:

- Clear description of the feature
- Use case and benefits
- Possible implementation approach
- Acceptance criteria

### Labels

We use these labels to categorize issues:

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to docs
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `ai/ml`: Related to AI/ML components
- `blockchain`: Related to smart contracts
- `frontend`: Related to UI/UX
- `backend`: Related to server-side code
- `iot`: Related to IoT integration

## Getting Help

- 💬 Join our discussions on GitHub
- 📧 Email us at contact@gaia.vn
- 📖 Check the [documentation](README.md)
- 🐛 Browse [existing issues](https://github.com/minhe51805/Pione_AIBlockchainIoT-WAGTeam/issues)

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes for significant contributions
- Annual contributor spotlight

Thank you for contributing to GAIA.VN! 🌱🚀
