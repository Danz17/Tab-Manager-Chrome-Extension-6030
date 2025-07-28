# TabBoard - Smart Tab Manager Chrome Extension

A powerful Chrome extension that replaces your new tab page with an intelligent tab management board featuring AI-powered clustering, automation, and advanced productivity features.

## Features

### 🤖 AI-Powered Organization
- **Smart Clustering**: Automatically group tabs by topic, domain, and content similarity
- **Intelligent Collections**: AI suggests optimal tab groupings based on browsing patterns
- **Topic Detection**: Advanced algorithms identify and categorize tab content

### 🔍 Advanced Search & Navigation
- **Fuzzy Search**: Find any tab instantly across current tabs, saved collections, and history
- **Command Bar**: Lightning-fast keyboard-driven interface (Ctrl+K)
- **Smart Filtering**: Filter by domain, date, collection type, and custom criteria

### ⚡ Automation & Rules
- **Auto-Archive**: Automatically save and close idle tabs after specified time
- **Duplicate Detection**: Identify and manage duplicate tabs
- **Custom Rules**: Create automation rules for specific domains or patterns
- **Smart Grouping**: Automatically group similar tabs using Chrome's tab groups

### 💾 Session Management
- **Complete Session Saves**: Preserve entire browsing sessions with scroll positions
- **Selective Saving**: Save individual tabs or specific tab groups
- **Session Restoration**: Restore complete sessions with all metadata intact
- **Export/Import**: Backup and sync your data across devices

### 📝 Rich Annotations
- **Tab Notes**: Add contextual notes to any tab or collection
- **To-Do Integration**: Convert tabs into actionable tasks
- **Reminders**: Set time-based reminders for important tabs
- **Tags & Labels**: Organize with custom tags and color-coded labels

### 🔒 Privacy & Security
- **End-to-End Encryption**: All data encrypted locally using AES-256-GCM
- **Local Storage**: Data never leaves your device unprotected
- **Sensitive Data Filtering**: Automatically excludes passwords and payment info
- **Configurable Retention**: Set custom data retention periods

## Installation

### From Chrome Web Store
1. Visit the Chrome Web Store
2. Search for "TabBoard"
3. Click "Add to Chrome"
4. Follow the installation prompts

### Manual Installation (Development)
1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension will appear in your extensions list

## Usage

### Getting Started
1. **Open New Tab**: TabBoard automatically replaces your new tab page
2. **Save Tabs**: Use Ctrl+S to save all current tabs or click individual save buttons
3. **Search Everything**: Press Ctrl+K to open the command bar for instant search
4. **Try AI Clustering**: Click "AI Cluster" to automatically organize your tabs

### Keyboard Shortcuts
- `Ctrl+K` - Open command bar
- `Ctrl+S` - Save all current tabs
- `Esc` - Close modals and overlays
- `Enter` - Execute selected command

### Command Bar
The command bar provides instant access to:
- Current open tabs
- Saved collections
- Browser history
- Automation controls
- Settings and preferences

### Collections
- **Current Tabs**: Live view of all open tabs with save/close actions
- **Saved Collections**: Organized groups of saved tabs
- **AI Clusters**: Automatically generated topic-based collections
- **Quick Saves**: Rapidly saved individual tabs

### Automation Rules
Create custom automation rules to:
- Auto-archive tabs idle for X hours
- Close duplicate tabs automatically
- Group tabs by domain or pattern
- Bookmark important tabs
- Mute or pin tabs based on criteria

## Configuration

### Settings Access
1. Click the TabBoard icon in the extension toolbar
2. Select "Settings" from the popup
3. Or navigate directly via the settings button in the new tab page

### Available Settings

#### General
- Theme selection (Light/Dark/Auto)
- Default collection naming format
- Notification preferences
- Welcome screen toggle

#### Automation
- Idle tab threshold configuration
- Duplicate tab handling
- Custom automation rules
- Smart grouping preferences

#### AI & Clustering
- Clustering sensitivity levels
- Minimum cluster size
- Auto-clustering triggers
- Topic detection settings

#### Privacy & Security
- Data retention periods
- Sensitive data exclusions
- Encryption preferences
- Data clearing options

#### Import/Export
- Full data export to JSON
- Import from backup files
- Settings reset options
- Cross-device sync preparation

## Data Storage

### Local Storage
All data is stored locally using Chrome's storage API with the following structure:
- `collections_*`: Encrypted tab collections
- `settings`: User preferences and configuration
- `automationRules`: Custom automation rules
- `tab_activity_*`: Tab usage tracking data
- `tab_session_*`: Session restoration data

### Encryption
- **Algorithm**: AES-256-GCM
- **Key Generation**: Cryptographically secure random keys
- **Storage**: Keys stored locally, never transmitted
- **Scope**: All user data except basic settings

### Data Export Format
```json
{
  "collections": [...],
  "settings": {...},
  "automationRules": [...],
  "exportedAt": "ISO-8601-timestamp",
  "version": "1.0.0"
}
```

## Architecture

### Core Components
- **TabBoard**: Main interface controller
- **StorageManager**: Encrypted data persistence
- **TabManager**: Chrome tabs API integration
- **AIClusterer**: Machine learning clustering engine
- **AutomationEngine**: Rules processing and execution
- **CommandBar**: Search and navigation interface

### Background Services
- **Tab Activity Tracking**: Monitor tab usage patterns
- **Automation Processing**: Execute rules and triggers
- **Session Management**: Preserve scroll positions and form data
- **Cleanup Tasks**: Periodic data maintenance

### Content Scripts
- **Scroll Position Tracking**: Capture and restore scroll states
- **Form Data Preservation**: Save non-sensitive form inputs
- **Activity Monitoring**: Track user engagement metrics

## Performance

### Optimization Features
- **Lazy Loading**: Collections loaded on demand
- **Efficient Search**: Indexed fuzzy search algorithms
- **Memory Management**: Automatic cleanup of old data
- **Background Processing**: Non-blocking automation execution

### Resource Usage
- **Memory**: ~10-50MB depending on collection size
- **Storage**: Scales with saved tabs (typically <100MB)
- **CPU**: Minimal impact with periodic background tasks
- **Network**: Zero network usage (fully offline)

## Troubleshooting

### Common Issues

#### Extension Not Loading
1. Check Chrome version compatibility (minimum: Chrome 88)
2. Verify extension is enabled in `chrome://extensions/`
3. Try disabling/re-enabling the extension
4. Clear extension data and restart Chrome

#### Data Not Saving
1. Check available storage space
2. Verify encryption key initialization
3. Try exporting/importing data to reset storage
4. Check browser permissions

#### Search Not Working
1. Clear search index cache
2. Rebuild collections database
3. Check for corrupted data
4. Reset to default settings

#### Performance Issues
1. Reduce data retention period
2. Clear old activity data
3. Disable unused automation rules
4. Limit collection sizes

### Debug Mode
Enable debug logging by:
1. Opening Chrome DevTools (F12)
2. Navigate to Console tab
3. Enter: `localStorage.setItem('tabboard_debug', 'true')`
4. Reload the extension

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Load extension in Chrome developer mode
4. Make changes and test thoroughly
5. Submit pull request with detailed description

### Code Style
- Use ES6+ features
- Follow existing naming conventions
- Add JSDoc comments for functions
- Maintain 2-space indentation
- Include error handling

### Testing
- Test all features manually
- Verify cross-browser compatibility
- Check performance impact
- Validate data encryption/decryption
- Test automation rules thoroughly

## Security

### Threat Model
- **Local Data Access**: Mitigated by encryption
- **Extension Permissions**: Minimal required permissions only
- **Data Exfiltration**: No network access, local-only storage
- **Cross-Site Scripting**: Content Security Policy enforcement

### Best Practices
- Regular security audits
- Minimal permission requests
- Secure random key generation
- Input validation and sanitization
- Safe data serialization

## Roadmap

### Version 1.1
- [ ] Cross-browser sync via secure cloud storage
- [ ] Advanced AI features (content summarization)
- [ ] Mobile companion app
- [ ] Team collaboration features

### Version 1.2
- [ ] Integration with productivity tools
- [ ] Advanced analytics dashboard
- [ ] Custom themes and layouts
- [ ] API for third-party integrations

### Version 2.0
- [ ] Machine learning personalization
- [ ] Voice commands integration
- [ ] Workspace management
- [ ] Enterprise features

## License

MIT License - see LICENSE file for details.

## Support

### Documentation
- [User Guide](docs/user-guide.md)
- [API Reference](docs/api-reference.md)
- [Troubleshooting](docs/troubleshooting.md)

### Community
- GitHub Issues for bug reports
- Discussions for feature requests
- Wiki for community contributions

### Contact
- Email: support@tabboard.dev
- GitHub: [@tabboard](https://github.com/tabboard)
- Twitter: [@TabBoardExt](https://twitter.com/TabBoardExt)

---

**TabBoard** - Transform your browsing experience with intelligent tab management.