import { loadConfig } from '../utils/config.js';
import { ReferenceSelector } from '../utils/referenceSelector.js';

interface ListReferencesResponse {
  success: boolean;
  references?: Array<{
    id: string;
    name?: string;
    tags?: string[];
    isDefault?: boolean;
  }>;
  defaultReference?: string;
  error?: string;
}

export class ListReferencesTool {
  name = 'fish_audio_list_references';
  description = 'List all configured voice references';
  
  inputSchema = {
    type: 'object' as const,
    properties: {}
  };

  async run(): Promise<ListReferencesResponse> {
    try {
      const config = loadConfig();
      
      if (!config.references || config.references.length === 0) {
        return {
          success: true,
          references: [],
          defaultReference: config.defaultReference || config.referenceId,
          error: 'No references configured. Using single reference mode.'
        };
      }
      
      const selector = new ReferenceSelector(config.references, config.defaultReference);
      const references = selector.getAllReferences();
      
      return {
        success: true,
        references: references.map(ref => ({
          ...ref,
          isDefault: ref.id === config.defaultReference
        })),
        defaultReference: config.defaultReference
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}