# Contributing to Receipt Organizer

Thank you for your interest in contributing to Receipt Organizer! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- Git
- A Firebase project (for testing)
- Google Cloud Vision API key (for testing)

### Development Setup

1. Fork the repository
2. Clone your fork: \`git clone https://github.com/your-username/receipt-organizer.git\`
3. Install dependencies: \`npm install\`
4. Copy \`.env.example\` to \`.env\` and fill in your API keys
5. Start the development server: \`npm start\`

## 📝 How to Contribute

### Reporting Bugs

Before creating a bug report, please:

1. Check if the issue already exists in [GitHub Issues](https://github.com/your-username/receipt-organizer/issues)
2. Update to the latest version to see if the issue persists
3. Gather relevant information (device, OS version, app version, steps to reproduce)

When creating a bug report, include:

- **Clear title** describing the issue
- **Detailed description** of the problem
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (device, OS, app version)
- **Console logs** if relevant

### Suggesting Features

We welcome feature suggestions! Please:

1. Check existing issues to avoid duplicates
2. Clearly describe the feature and its benefits
3. Explain the use case and target users
4. Consider implementation complexity
5. Be open to discussion and feedback

### Code Contributions

#### Branch Naming

Use descriptive branch names:
- \`feature/add-csv-export\`
- \`fix/ocr-parsing-error\`
- \`docs/update-readme\`
- \`refactor/improve-performance\`

#### Commit Messages

Follow conventional commit format:
- \`feat: add CSV export functionality\`
- \`fix: resolve OCR parsing error for receipts\`
- \`docs: update installation instructions\`
- \`refactor: improve receipt parsing performance\`
- \`test: add unit tests for parser service\`

#### Pull Request Process

1. **Create a feature branch** from \`main\`
2. **Make your changes** following our coding standards
3. **Test thoroughly** on both iOS and Android
4. **Update documentation** if needed
5. **Run linting and type checking**: \`npm run lint && npm run type-check\`
6. **Create a pull request** with a clear description

#### Pull Request Template

\`\`\`markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Added/updated tests
- [ ] Verified no regressions

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors/warnings
\`\`\`

## 🎨 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid \`any\` type when possible
- Use strict mode settings

### React/React Native

- Use functional components with hooks
- Follow React best practices
- Use proper prop types and interfaces
- Implement proper error boundaries

### Styling

- Use the existing theme system
- Follow Material Design 3 principles
- Ensure responsive design
- Test on different screen sizes

### Code Organization

- Keep components small and focused
- Use proper file and folder structure
- Separate concerns (UI, logic, data)
- Write reusable utilities

### Performance

- Optimize images and assets
- Use proper list virtualization
- Implement proper caching
- Monitor bundle size

## 🧪 Testing Guidelines

### Manual Testing

- Test on both iOS and Android
- Test different screen sizes
- Test with poor network conditions
- Test edge cases and error scenarios
- Verify accessibility features

### Automated Testing

- Write unit tests for utilities and services
- Test React components with React Testing Library
- Mock external dependencies
- Maintain good test coverage

### OCR Testing

- Test with various receipt formats
- Test with different image qualities
- Test error handling for failed OCR
- Verify parsing accuracy

## 📚 Documentation

### Code Documentation

- Write clear comments for complex logic
- Document public APIs and interfaces
- Include JSDoc comments for functions
- Update README for new features

### User Documentation

- Update user-facing documentation
- Include screenshots for UI changes
- Write clear setup instructions
- Document configuration options

## 🔧 Development Tools

### Required Tools

- **ESLint**: Code linting
- **TypeScript**: Type checking
- **Prettier**: Code formatting (optional but recommended)

### Recommended Extensions (VS Code)

- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- ESLint
- Prettier
- React Native Tools

## 🚀 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version number bumped
- [ ] Changelog updated
- [ ] Build tested on both platforms
- [ ] Performance verified
- [ ] Security review completed

## 🏗️ Architecture Guidelines

### State Management

- Use React Context for global state
- Keep state as local as possible
- Use proper state normalization
- Implement optimistic updates

### API Integration

- Use proper error handling
- Implement retry logic
- Cache responses when appropriate
- Handle offline scenarios

### Security

- Never commit API keys or secrets
- Validate all user inputs
- Use proper authentication
- Follow Firebase security rules

## 🎯 Priority Areas

We're especially looking for contributions in:

1. **OCR Accuracy**: Improving text parsing algorithms
2. **Performance**: Optimizing app performance
3. **Accessibility**: Making the app more accessible
4. **Testing**: Adding comprehensive tests
5. **Documentation**: Improving docs and examples
6. **Internationalization**: Adding multi-language support

## 💡 Tips for New Contributors

- Start with small, focused changes
- Ask questions if anything is unclear
- Read existing code to understand patterns
- Test thoroughly before submitting
- Be patient with the review process
- Learn from feedback and iterate

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Email**: support@receiptorganizer.com for sensitive issues

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special thanks in app credits

Thank you for contributing to Receipt Organizer! 🎉

