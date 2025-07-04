import { ReferenceConfig } from '../types/index.js';

export class ReferenceSelector {
  private references: ReferenceConfig[];
  private defaultReference?: string;
  
  constructor(references: ReferenceConfig[], defaultReference?: string) {
    this.references = references;
    this.defaultReference = defaultReference;
  }
  
  /**
   * Find reference by ID
   */
  findById(id: string): ReferenceConfig | undefined {
    return this.references.find(ref => ref.id === id);
  }
  
  /**
   * Find reference by name
   */
  findByName(name: string): ReferenceConfig | undefined {
    return this.references.find(ref => 
      ref.name?.toLowerCase() === name.toLowerCase()
    );
  }
  
  /**
   * Find reference by tag
   */
  findByTag(tag: string): ReferenceConfig | undefined {
    return this.references.find(ref => 
      ref.tags?.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }
  
  /**
   * Select reference based on parameters
   */
  selectReference(params: {
    id?: string;
    name?: string;
    tag?: string;
  }): string | undefined {
    // Priority: ID > Name > Tag > Default
    if (params.id) {
      const ref = this.findById(params.id);
      if (ref) return ref.id;
    }
    
    if (params.name) {
      const ref = this.findByName(params.name);
      if (ref) return ref.id;
    }
    
    if (params.tag) {
      const ref = this.findByTag(params.tag);
      if (ref) return ref.id;
    }
    
    // Return default if no match found
    return this.defaultReference;
  }
  
  /**
   * Get all available references
   */
  getAllReferences(): ReferenceConfig[] {
    return this.references;
  }
  
  /**
   * Get reference summary for logging
   */
  getReferenceSummary(): string {
    if (this.references.length === 0) {
      return 'No references configured';
    }
    
    return this.references.map(ref => {
      const parts = [ref.id];
      if (ref.name) parts.push(`name: ${ref.name}`);
      if (ref.tags && ref.tags.length > 0) parts.push(`tags: ${ref.tags.join(', ')}`);
      return `- ${parts.join(', ')}`;
    }).join('\n');
  }
}