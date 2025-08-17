/**
 * Performance test to identify export bottlenecks
 */
export class PerformanceTest {
  private marks: Map<string, number> = new Map();
  
  start(label: string) {
    this.marks.set(label, performance.now());
    console.log(`⏱️ START: ${label}`);
  }
  
  end(label: string): number {
    const startTime = this.marks.get(label);
    if (!startTime) {
      console.error(`No start mark for ${label}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    console.log(`⏱️ END: ${label} - took ${duration.toFixed(2)}ms (${(duration/1000).toFixed(2)}s)`);
    this.marks.delete(label);
    return duration;
  }
  
  measure(label: string, fn: () => any) {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }
  
  async measureAsync(label: string, fn: () => Promise<any>) {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  }
  
  report() {
    console.log("=== Performance Report ===");
    for (const [label, time] of this.marks) {
      console.log(`${label}: Started but not ended`);
    }
  }
}