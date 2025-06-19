import { StorageService } from './storage';
import { Session, Cycle, DailyStats, Settings } from '../types';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export interface ExportOptions {
  format: 'json' | 'csv';
  dateRange: 'all' | 'week' | 'month' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  includeSettings?: boolean;
  includeSessions?: boolean;
  includeCycles?: boolean;
  includeStats?: boolean;
}

export interface ExportData {
  metadata: {
    exportDate: string;
    dateRange: string;
    appVersion: string;
    totalRecords: number;
  };
  settings?: Settings;
  sessions?: Session[];
  cycles?: Cycle[];
  dailyStats?: DailyStats[];
}

export class DataExportService {
  
  static async exportData(options: ExportOptions): Promise<string> {
    try {
      const data = await this.prepareExportData(options);
      
      if (options.format === 'json') {
        return await this.exportAsJSON(data, options);
      } else {
        return await this.exportAsCSV(data, options);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data. Please try again.');
    }
  }

  private static async prepareExportData(options: ExportOptions): Promise<ExportData> {
    const data: ExportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        dateRange: this.getDateRangeDescription(options),
        appVersion: '1.0.0', // You can get this from package.json
        totalRecords: 0,
      },
    };

    // Get date range
    const { startDate, endDate } = await this.getDateRange(options);

    // Include settings if requested
    if (options.includeSettings) {
      data.settings = await StorageService.getSettings();
    }

    // Include sessions if requested
    if (options.includeSessions) {
      if (options.dateRange === 'all') {
        data.sessions = await StorageService.getSessions();
      } else {
        data.sessions = await StorageService.getSessionsForDateRange(startDate, endDate);
      }
    }

    // Include cycles if requested
    if (options.includeCycles) {
      if (options.dateRange === 'all') {
        data.cycles = await StorageService.getCycles();
      } else {
        data.cycles = await StorageService.getCyclesForDateRange(startDate, endDate);
      }
    }

    // Include daily stats if requested
    if (options.includeStats) {
      if (options.dateRange === 'all') {
        // Get all available stats
        data.dailyStats = await this.getAllDailyStats();
      } else {
        data.dailyStats = await StorageService.getStatsForDateRange(startDate, endDate);
      }
    }

    // Update total records count
    data.metadata.totalRecords = (
      (data.sessions?.length || 0) + 
      (data.cycles?.length || 0) +
      (data.dailyStats?.length || 0) + 
      (data.settings ? 1 : 0)
    );

    return data;
  }

  private static async getAllDailyStats(): Promise<DailyStats[]> {
    // Get stats for the past year or all available data
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    return StorageService.getStatsForDateRange(
      startDate.toISOString().split('T')[0],
      endDate
    );
  }

  private static async getDateRange(options: ExportOptions): Promise<{ startDate: string; endDate: string }> {
    const today = new Date();
    let startDate: Date;
    let endDate: Date = today;

    switch (options.dateRange) {
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'custom':
        if (!options.customStartDate || !options.customEndDate) {
          throw new Error('Custom date range requires start and end dates');
        }
        startDate = new Date(options.customStartDate);
        endDate = new Date(options.customEndDate);
        break;
      default:
        // For 'all', we'll use a very early date
        startDate = new Date('2020-01-01');
        break;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }

  private static getDateRangeDescription(options: ExportOptions): string {
    switch (options.dateRange) {
      case 'week':
        return 'Last 7 days';
      case 'month':
        return 'Last 30 days';
      case 'custom':
        return `${options.customStartDate} to ${options.customEndDate}`;
      default:
        return 'All time';
    }
  }

  private static async exportAsJSON(data: ExportData, options: ExportOptions): Promise<string> {
    const fileName = `pomodoro-data-${this.getDateString()}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    const jsonContent = JSON.stringify(data, null, 2);
    
    await FileSystem.writeAsStringAsync(fileUri, jsonContent);
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Pomodoro Data',
      });
    }
    
    return fileUri;
  }

  private static async exportAsCSV(data: ExportData, options: ExportOptions): Promise<string> {
    let csvContent = '';
    
    // Export settings as CSV if included
    if (data.settings && options.includeSettings) {
      csvContent += '=== SETTINGS ===\n';
      csvContent += 'Setting,Value\n';
      csvContent += `Work Duration,${data.settings.workDuration}\n`;
      csvContent += `Short Break Duration,${data.settings.shortBreakDuration}\n`;
      csvContent += `Long Break Duration,${data.settings.longBreakDuration}\n`;
      csvContent += `Cycle Duration,${data.settings.cycleDuration}\n`;
      csvContent += `Sound Enabled,${data.settings.soundEnabled}\n`;
      csvContent += `Volume,${data.settings.volume}\n`;
      csvContent += `Auto Start Breaks,${data.settings.autoStartBreaks}\n`;
      csvContent += `Auto Start Work Sessions,${data.settings.autoStartWorkSessions}\n`;
      csvContent += `Daily Goal,${data.settings.goals.dailyCycles}\n`;
      csvContent += `Weekly Goal,${data.settings.goals.weeklyCycles}\n`;
      csvContent += '\n';
    }

    // Export daily stats as CSV if included
    if (data.dailyStats && options.includeStats) {
      csvContent += '=== DAILY STATISTICS ===\n';
      csvContent += 'Date,Completed Cycles,Focus Time (min),Break Time (min),Streak,Categories\n';
      
      data.dailyStats.forEach(stat => {
        const categoriesStr = Object.entries(stat.categories || {})
          .map(([cat, count]) => `${cat}:${count}`)
          .join(';');
        
        csvContent += `${stat.date},${stat.completedCycles},${stat.totalFocusTime},${stat.totalBreakTime},${stat.streak},"${categoriesStr}"\n`;
      });
      csvContent += '\n';
    }

    // Export cycles as CSV if included
    if (data.cycles && options.includeCycles) {
      csvContent += '=== CYCLES ===\n';
      csvContent += 'ID,Label,Category,Start Time,End Time,Completed,Sessions Count\n';
      
      data.cycles.forEach(cycle => {
        const startTime = new Date(cycle.startTime).toISOString();
        const endTime = cycle.endTime ? new Date(cycle.endTime).toISOString() : '';
        
        csvContent += `${cycle.id},"${cycle.label || ''}","${cycle.category || ''}",${startTime},${endTime},${cycle.completed},${cycle.sessions.length}\n`;
      });
      csvContent += '\n';
    }

    // Export sessions as CSV if included
    if (data.sessions && options.includeSessions) {
      csvContent += '=== SESSIONS ===\n';
      csvContent += 'ID,Cycle ID,Type,Duration (min),Start Time,End Time,Completed\n';
      
      data.sessions.forEach(session => {
        const startTime = new Date(session.startTime).toISOString();
        const endTime = session.endTime ? new Date(session.endTime).toISOString() : '';
        
        csvContent += `${session.id},${session.cycleId},${session.type},${session.duration},${startTime},${endTime},${session.completed}\n`;
      });
    }

    const fileName = `pomodoro-data-${this.getDateString()}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, csvContent);
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Pomodoro Data',
      });
    }
    
    return fileUri;
  }

  private static getDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  static async getExportPreview(options: ExportOptions): Promise<{
    sessionsCount: number;
    cyclesCount: number;
    statsCount: number;
    dateRange: string;
    estimatedSize: string;
  }> {
    const { startDate, endDate } = await this.getDateRange(options);
    
    let sessionsCount = 0;
    let cyclesCount = 0;
    let statsCount = 0;

    if (options.includeSessions) {
      const sessions = options.dateRange === 'all' 
        ? await StorageService.getSessions()
        : await StorageService.getSessionsForDateRange(startDate, endDate);
      sessionsCount = sessions.length;
    }

    if (options.includeCycles) {
      const cycles = options.dateRange === 'all' 
        ? await StorageService.getCycles()
        : await StorageService.getCyclesForDateRange(startDate, endDate);
      cyclesCount = cycles.length;
    }

    if (options.includeStats) {
      const stats = options.dateRange === 'all'
        ? await this.getAllDailyStats()
        : await StorageService.getStatsForDateRange(startDate, endDate);
      statsCount = stats.length;
    }

    // Estimate file size (rough calculation)
    const avgSessionSize = 150; // bytes per session
    const avgCycleSize = 250; // bytes per cycle
    const avgStatsSize = 150; // bytes per daily stat
    const settingsSize = options.includeSettings ? 500 : 0;
    
    const estimatedBytes = (sessionsCount * avgSessionSize) + (cyclesCount * avgCycleSize) + (statsCount * avgStatsSize) + settingsSize;
    const estimatedSize = estimatedBytes < 1024 
      ? `${estimatedBytes} B`
      : estimatedBytes < 1024 * 1024 
        ? `${Math.round(estimatedBytes / 1024)} KB`
        : `${Math.round(estimatedBytes / (1024 * 1024))} MB`;

    return {
      sessionsCount,
      cyclesCount,
      statsCount,
      dateRange: this.getDateRangeDescription(options),
      estimatedSize,
    };
  }
} 