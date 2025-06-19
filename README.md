# PomodoroX - Focused Productivity Timer (WIP)

A modern, focused Pomodoro timer mobile app built with Expo React Native. PomodoroX implements the classic Pomodoro Technique while providing essential customization and tracking features to help users maximize their productivity.

## 🍅 About the Pomodoro Technique

The Pomodoro Technique is a time management method that uses a timer to break work into focused 25-minute intervals (called "Pomodoros") separated by short breaks. After four Pomodoros, a longer break is taken. This method helps improve focus, reduce mental fatigue, and increase productivity.

**In PomodoroX, a cycle consists of:**
- 4 work sessions (25 minutes each)
- 3 short breaks (5 minutes each)  
- 1 long break (15 minutes)
- **Total cycle time**: ~2 hours
- **Completion rule**: At least half of work sessions must be completed (not skipped) for the cycle to count

## ✨ Features

### Phase 1: Core Timer Functionality ✅
- **Classic Pomodoro Timer**: 25-minute work sessions with 5-minute breaks
- **Intuitive Controls**: Play, pause, stop, and skip functionality
- **Visual Countdown**: Large, prominent timer display with smooth animations
- **Audio Notifications**: Customizable sounds for session completion
- **Session Counter**: Track completed Pomodoros for the current day
- **Clean Interface**: Minimalist design focused on productivity

### Phase 2: Customization & Settings ✅
- **Flexible Timer Durations**: Customize work and break periods to fit your workflow
- **Long Break Management**: Automatic 15-30 minute breaks after every 4 Pomodoros
- **Sound Customization**: Multiple notification sounds with volume control
- **Smart Automation**: Optional auto-start for breaks and work sessions
- **Visual Preferences**: Customizable notification styles

### Phase 3: Tracking & Analytics ✅
- **Cycle Labeling**: Label complete pomodoro cycles with task names and categories
- **Smart Label Persistence**: Labels automatically carry forward to new cycles
- **Comprehensive Statistics**: Daily, weekly, and monthly productivity insights
- **Goal Setting**: Set and track daily/weekly Pomodoro and focus time targets
- **Streak Tracking**: Monitor consecutive productive days
- **Category Analytics**: Breakdown of time spent across different work categories
- **Progress Tracking**: Real-time progress bars for daily goals
- **Data Export**: Export cycles, sessions, and statistics for external analysis

### Phase 4: Enhanced Features 🚧
- **Theme System**: ✅ Auto/Light/Dark theme with system detection
- **Task Integration**: Link specific tasks to cycles
- **Ambient Sounds**: Optional background noise and white noise
- **Accessibility**: Full keyboard navigation and screen reader support
- **Focus Mode**: Distraction-free minimal interface

## 🔄 Cycle-Based Architecture

PomodoroX uses a **cycle-based architecture** where productivity is tracked at the cycle level, not individual sessions:

### 🎯 **Cycles (Pomodoros)**
- **Primary tracking unit**: One cycle = one completed Pomodoro
- **Contains**: 4 work sessions + 3 short breaks + 1 long break
- **Labels & Categories**: Applied to entire cycles for meaningful organization
- **Duration**: ~2 hours per complete cycle
- **Completion Criteria**: At least 50% of work sessions must be completed (not skipped)

### ⏱️ **Sessions**
- **Building blocks**: Individual work/break periods within a cycle
- **Types**: Work (25min), Short Break (5min), Long Break (15min)
- **Relationship**: Sessions belong to cycles via `cycleId`

### 🏷️ **Smart Labeling**
- **Cycle Labels**: "Deep Work", "Email & Communication", "Planning", etc.
- **Categories**: Work, Study, Personal, Health, Creative, etc.
- **Persistence**: Labels automatically carry forward to new cycles
- **Flexibility**: Change labels mid-cycle or set new defaults

## 🎨 Design System

### Color Palette
```
Primary:     #ff6b6b (Tomato Red)    - Active states, work sessions
Secondary:   #51cf66 (Sage Green)    - Break sessions, success states
Accent:      #ffa94d (Warm Orange)   - Highlights, CTAs
Background:  #fafafa (Off-white)     - Light theme background
Dark BG:     #2c2c2c (Charcoal)     - Dark theme background
Text:        #343a40 (Dark Gray)     - Primary text
Muted:       #868e96 (Light Gray)    - Secondary text
```

### Typography
- **Primary Font**: Lato (with Regular, Bold, and Black weights)
- **Timer Display**: 48px for maximum readability
- **Headers**: 24px for section titles
- **Body**: 16px for general content
- **Captions**: 14px for secondary information

### Layout Principles
- 8px grid system for consistent spacing
- Generous whitespace for reduced cognitive load
- Centered layouts with breathing room
- Touch-friendly controls (minimum 44px targets)

## 🏗️ Technical Architecture

### Tech Stack
- **Framework**: Expo SDK 53+
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State Management**: React Context + useReducer
- **Storage**: AsyncStorage for settings, cycles, and session history
- **Notifications**: Expo Notifications
- **Audio**: Expo Audio
- **Data Export**: Expo Sharing + FileSystem
- **Styling**: React Native StyleSheet with design tokens

### Data Models

#### Cycle
```typescript
interface Cycle {
  id: string;
  label?: string;                    // "Deep Work", "Email", etc.
  category?: string;                 // "work", "study", "personal"
  startTime: number;                 // timestamp
  endTime?: number;                  // timestamp when cycle completes
  completed: boolean;
  sessions: Session[];               // All sessions in this cycle
}
```

#### Session
```typescript
interface Session {
  id: string;
  cycleId: string;                   // Reference to parent cycle
  type: 'work' | 'shortBreak' | 'longBreak';
  duration: number;                  // minutes
  startTime: number;                 // timestamp
  endTime?: number;                  // timestamp
  completed: boolean;
}
```

#### Goals
```typescript
interface Goals {
  dailyCycles: number;            // default: 8 cycles
  weeklyCycles: number;           // default: 40 cycles
  dailyFocusTime: number;            // minutes, default: 200
  streakTarget: number;              // days, default: 7
}
```

#### Settings
```typescript
interface Settings {
  workDuration: number;              // default: 25
  shortBreakDuration: number;        // default: 5
  longBreakDuration: number;         // default: 15
  cycleDuration: number;             // default: 4
  soundEnabled: boolean;
  soundType: string;
  volume: number;                    // 0-100
  autoStartBreaks: boolean;
  autoStartWorkSessions: boolean;
  theme: 'light' | 'dark';
  goals: Goals;                      // user goals
}
```

#### Statistics
```typescript
interface DailyStats {
  date: string;                      // YYYY-MM-DD
  completedCycles: number;        // completed cycles
  totalFocusTime: number;            // minutes
  totalBreakTime: number;            // minutes
  streak: number;                    // consecutive days
  categories: Record<string, number>; // category usage counts
}
```

### Timer Context
```typescript
interface TimerContext {
  currentSession: Session | null;
  currentCycle: Cycle | null;        // Current active cycle
  defaultLabel: string;              // Persists between cycles
  defaultCategory: string;           // Persists between cycles
  completedCycles: number;        // Completed cycles count
  updateCycleLabel: (label: string, category: string) => Promise<void>;
  setDefaultLabel: (label: string, category: string) => void;
  // ... other timer methods
}
```

## 🚀 Development Roadmap

### Phase 1: Foundation (Weeks 1-2) ✅
- ✅ Set up Expo project with TypeScript
- ✅ Implement core timer logic with background functionality
- ✅ Create basic UI components and navigation
- ✅ Add audio notifications and local storage
- ✅ Basic session tracking

### Phase 2: Enhancement (Weeks 3-4) ✅
- ✅ Add settings panel with customization options
- ✅ Implement long break logic
- ✅ Enhance audio and visual notifications
- ✅ Add auto-start functionality
- ✅ Polish UI/UX and animations

### Phase 3: Analytics & Goals (Weeks 5-6) ✅
- ✅ Implement cycle-based architecture
- ✅ Build cycle labeling and categorization system
- ✅ Add goal setting and progress tracking
- ✅ Create statistics dashboard with category breakdown
- ✅ Implement streak tracking
- ✅ Add comprehensive data export functionality
- ✅ Smart label persistence between cycles

### Phase 4: Advanced Features (Weeks 7-8) 🎯
- Task management integration
- Ambient sound features
- Accessibility improvements
- Performance optimizations
- App store preparation

## 📱 Platform Support
- **iOS**: 13.0+
- **Android**: API level 21+ (Android 5.0)
- **Expo Go**: Compatible for development
- **Standalone**: Optimized for production builds

## 🎯 Success Metrics
- **Quick Start**: Users complete first cycle within 2 minutes of launch
- **Engagement**: 70% of users complete 2+ cycles in first session
- **Retention**: Users return within 7 days of first use
- **Productivity**: Average 4+ cycles per active user daily
- **Completion Rate**: <5% session abandonment during active timers
- **Goal Achievement**: 60% of users reach daily goals within first week

## 🔧 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (for development)

### Installation
```bash
# Clone the repository
git clone https://github.com/koami4k0ntrast/pomodoro-x.git
cd pomodoro-x

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Development Scripts
```bash
npm run start          # Start Expo development server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm run web            # Run on web browser
```

## 🚀 Phase 1 Implementation Status

### ✅ Completed Features
- **Core Timer**: 25-minute work sessions with 5-minute breaks
- **Timer Controls**: Play, pause, resume, stop, and skip functionality
- **Visual Interface**: Clean, modern UI with circular timer display
- **Session Tracking**: Count completed Pomodoros for the day
- **Persistent Storage**: Settings and session history saved locally
- **Background Timer**: Timer continues running when app is in background
- **Notifications**: Vibration feedback when sessions complete
- **Responsive Design**: Works on both iOS and Android

### 📱 Core Components
- `TimerDisplay`: Large circular countdown with session type indicators
- `ControlButtons`: Dynamic control buttons based on timer state
- `SessionCounter`: Visual representation of completed Pomodoros
- `TimerScreen`: Main screen combining all components
- `TimerContext`: Centralized state management for all timer logic

## 🚀 Phase 2 Implementation Status

### ✅ Completed Features
- **Settings Panel**: Complete customization interface with timer durations, auto-start options, and sound preferences
- **Long Break Logic**: Automatic long break scheduling after configured number of work sessions (default: 4)
- **Auto-Start Functionality**: Optional automatic session transitions with 3-second delay
- **Enhanced UI**: Settings button, improved navigation, and polished interface
- **Smart Session Management**: Context-aware next session suggestions

### 📱 Enhanced Components
- `SettingsScreen`: Full settings interface with scrollable sections
- `DurationPicker`: Custom duration selector with increment/decrement controls
- `VolumeSlider`: Volume control with visual feedback
- `MainScreen`: Navigation controller between timer and settings

## 🚀 Phase 3 Implementation Status

### ✅ Completed Features

#### 🔄 **Cycle-Based Architecture**
- **Cycle Management**: Complete refactoring to cycle-based tracking
- **Smart Relationships**: Sessions belong to cycles via `cycleId`
- **Data Integrity**: Proper cycle completion tracking through long breaks

#### 🏷️ **Labeling & Categorization**
- **Cycle Labels**: "Deep Work", "Email & Communication", "Planning", etc.
- **Predefined Categories**: Work, Study, Personal, Health, Creative, Learning, Side Project, Admin
- **Smart Persistence**: Labels automatically carry forward to new cycles
- **Quick Labels**: 10 common productivity labels for fast selection
- **Custom Categories**: Support for user-defined categories

#### 📊 **Goal Setting & Progress**
- **Daily Goals**: Pomodoro count and focus time targets
- **Weekly Goals**: Extended productivity planning
- **Streak Targets**: Consecutive day goal achievement
- **Real-time Progress**: Live progress bars with color-coded status
- **Goal Customization**: Fully customizable targets in settings

#### 📈 **Enhanced Statistics**
- **Category Breakdown**: Top 5 categories with usage percentages
- **Focus vs Break Analysis**: Visual comparison with percentage breakdown and balance insights
- **Time Analysis**: Comprehensive focus and break time tracking
- **Streak Tracking**: Consecutive productive days
- **Historical Data**: Daily, weekly, and monthly views
- **Performance Metrics**: Average sessions per day, completion rates

#### 📤 **Data Export**
- **Multiple Formats**: JSON for analysis, CSV for spreadsheets
- **Flexible Data**: Export cycles, sessions, stats, and settings
- **Date Range Selection**: All time, last 30 days, or last 7 days
- **Export Preview**: See data counts and file size before export

### 📱 New Components Added
- `SessionInfoDisplay` → `CycleInfoDisplay`: Shows current cycle information
- `SessionLabelModal` → `CycleLabelModal`: Full-screen cycle labeling interface
- `GoalProgress`: Real-time progress tracking with visual indicators
- `GoalSettings`: Goal configuration interface
- `StatisticsScreen`: Enhanced with category breakdown
- `ExportModal`: Comprehensive data export interface

### 🔧 Enhanced Architecture
- **Storage Service**: Added cycle management methods
- **Timer Context**: Cycle-aware state management with label persistence
- **Type Safety**: Complete TypeScript coverage for new cycle architecture
- **Data Migration**: Seamless transition from session-based to cycle-based tracking

## 🐛 Known Issues
- Custom notification sounds not yet implemented (using vibration)
- Timer precision could be improved for better accuracy

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments
- Inspired by Francesco Cirillo's Pomodoro Technique
- Design influenced by modern productivity apps
- Built with the amazing Expo and React Native ecosystem

---

**Ready to boost your productivity? Download PomodoroX and start your first Pomodoro session today! 🍅** 