# Changelog

All notable changes to the Azion PageSpeed Analyzer TypeScript API will be documented in this file.

## [2.0.0] - 2025-10-21

### 🚀 Major Architecture Overhaul - Code Deduplication

This release represents a complete architectural refactoring focused on eliminating code duplication and improving maintainability.

#### ✨ **New Features**

- **Follow URL Redirects**: Added `follow_redirects` parameter to automatically follow HTTP redirects before analysis
- **Real-time Progress Tracking**: Enhanced manual interface with dynamic progress bars and step-by-step logging
- **Collapsible Log View**: Color-coded log entries (INFO, SUCCESS, WARNING, ERROR) with timestamps
- **Elapsed Time Tracking**: Analysis duration display in results header
- **Modular Result Components**: Unified result headers, summary grids, and download actions

#### 🏗️ **Architecture Changes**

- **Created `src/utils/` directory** with shared utilities:
  - `validation.ts` - Unified request validation logic
  - `error-handling.ts` - Standardized error response patterns
  - `manual-interface-styles.ts` - Centralized CSS styles
  - `manual-interface-template.ts` - Complete HTML/JS template

#### 🔄 **Code Deduplication**

- **Eliminated 1000+ lines of duplicated code** between `server.ts` and `function/index.ts`
- **Unified Manual Interface**: Single source of truth for HTML/CSS/JS across both implementations
- **Consolidated Validation**: Shared validation logic with proper type handling
- **Standardized Error Handling**: Consistent error responses across Express.js and Edge Functions
- **Single Template System**: Both server and edge function use the same manual interface

#### 🛠️ **Improvements**

- **Enhanced Manual Interface Features**:
  - Dynamic progress calculation based on configuration (CrUX, redirects)
  - Real-time log entries with detailed request/response information
  - Improved UI with better responsive design
  - Enhanced download functionality with file size information

- **Better Type Safety**: Improved TypeScript types and error handling
- **Consistent API**: Unified behavior between local Express server and Edge Functions
- **Improved Maintainability**: Single point of maintenance for shared functionality

#### 📜 **Scripts Updated**

- Added `npm run dev:edge` - Start Azion Edge Functions locally
- Added `npm run build:edge` - Build for Azion Edge Functions
- Added `npm run deploy` - Deploy to Azion Edge Network
- Updated `npm run clean` - Now removes both `dist/` and `.edge/` directories

#### 📚 **Documentation**

- **Updated README.md** with new architecture documentation
- **Enhanced API documentation** with `follow_redirects` parameter
- **Added architecture benefits** highlighting deduplication achievements
- **Updated usage examples** with new parameter
- **Improved project structure** documentation

#### 🔧 **Technical Details**

- **Shared Utilities**: All common functionality moved to `src/utils/`
- **Type Improvements**: Better error handling types and validation interfaces
- **Build Process**: Updated for both traditional and edge function deployments
- **Environment Handling**: Improved API key management across deployment types

#### 💡 **Benefits**

- **Maintainability**: 80% reduction in code duplication
- **Consistency**: Unified user experience across deployment targets
- **Performance**: Cleaner codebase with better organization
- **Developer Experience**: Easier to add features and fix bugs
- **Scalability**: Modular architecture supports future enhancements

---

## [1.0.0] - 2025-10-17

### 🎉 Initial Release

- **Core API Endpoints**: `/analyze`, `/report`, `/full`, `/html-json`
- **Manual Interface**: Interactive web interface for testing
- **PageSpeed Insights Integration**: Complete API integration
- **CrUX Data Support**: Chrome User Experience Report integration
- **Azion Solutions Mapping**: Performance issue to solution mapping
- **HTML Report Generation**: Beautiful, comprehensive reports
- **Dual Deployment**: Express.js server and Azion Edge Functions support
- **TypeScript**: Full type safety and modern development experience
