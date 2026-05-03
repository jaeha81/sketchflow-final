import type Anthropic from '@anthropic-ai/sdk'

const conf = { type: 'string', enum: ['high', 'medium', 'low', 'inferred'] } as const
const prio = { type: 'string', enum: ['critical', 'high', 'medium', 'low'] } as const

export const ANALYSIS_TOOL_SCHEMA: Anthropic.Tool['input_schema'] = {
  type: 'object',
  required: [
    'spatial_summary',
    'missing_info',
    'construction_categories',
    'estimate_items',
    'client_summary',
    'design_analysis',
  ],
  properties: {
    spatial_summary: {
      type: 'object',
      required: ['text', 'text_ko', 'zones', 'elements', 'overall_confidence'],
      properties: {
        text: { type: 'string' },
        text_ko: { type: 'string' },
        zones: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'name', 'name_ko', 'type', 'position', 'estimated_area_m2', 'confidence'],
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              name_ko: { type: 'string' },
              type: {
                type: 'string',
                enum: ['reception', 'office', 'meeting', 'pantry', 'storage', 'restroom', 'corridor', 'other'],
              },
              position: { type: 'string' },
              estimated_area_m2: { type: ['number', 'null'] },
              confidence: conf,
              elements: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        elements: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'type', 'subtype', 'position_description', 'confidence'],
            properties: {
              id: { type: 'string' },
              type: {
                type: 'string',
                enum: ['wall', 'door', 'window', 'counter', 'furniture', 'storage', 'fixture', 'other'],
              },
              subtype: { type: 'string' },
              position_description: { type: 'string' },
              confidence: conf,
            },
          },
        },
        overall_confidence: conf,
      },
    },
    missing_info: {
      type: 'object',
      required: ['items'],
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'category', 'description', 'description_ko', 'priority'],
            properties: {
              id: { type: 'string' },
              category: {
                type: 'string',
                enum: ['dimensions', 'ceiling', 'lighting', 'electrical', 'demolition', 'material', 'structural', 'mechanical', 'scope'],
              },
              description: { type: 'string' },
              description_ko: { type: 'string' },
              priority: prio,
              affects: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
    construction_categories: {
      type: 'object',
      required: ['categories'],
      properties: {
        categories: {
          type: 'array',
          items: {
            type: 'object',
            required: ['code', 'name', 'name_ko', 'scope', 'scope_ko', 'confidence', 'items'],
            properties: {
              code: {
                type: 'string',
                enum: ['DEMO', 'PART', 'CEIL', 'ELEC', 'LIGHT', 'FLOOR', 'FURN', 'PAINT', 'SIGN', 'PLUMB', 'HVAC', 'OTHER'],
              },
              name: { type: 'string' },
              name_ko: { type: 'string' },
              scope: { type: 'string' },
              scope_ko: { type: 'string' },
              confidence: conf,
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['name', 'name_ko', 'unit', 'note'],
                  properties: {
                    name: { type: 'string' },
                    name_ko: { type: 'string' },
                    unit: { type: 'string', enum: ['m²', 'm', 'EA', 'SET', 'LOT'] },
                    note: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    estimate_items: {
      type: 'object',
      required: ['items'],
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'category_code', 'name', 'name_ko', 'unit', 'estimated_quantity', 'note'],
            properties: {
              id: { type: 'string' },
              category_code: { type: 'string' },
              name: { type: 'string' },
              name_ko: { type: 'string' },
              unit: { type: 'string', enum: ['m²', 'm', 'EA', 'SET', 'LOT'] },
              estimated_quantity: { type: ['number', 'null'] },
              note: { type: 'string' },
            },
          },
        },
      },
    },
    client_summary: {
      type: 'object',
      required: ['text', 'text_ko', 'confirmed_items', 'pending_items'],
      properties: {
        text: { type: 'string' },
        text_ko: { type: 'string' },
        confirmed_items: { type: 'array', items: { type: 'string' } },
        pending_items: { type: 'array', items: { type: 'string' } },
      },
    },
    design_analysis: {
      type: 'object',
      required: ['style_concept', 'mood', 'color_palette', 'materials', 'layout_html', 'layout_css'],
      properties: {
        style_concept: { type: 'string' },
        mood: { type: 'string' },
        color_palette: {
          type: 'array',
          items: {
            type: 'object',
            required: ['role', 'name', 'hex', 'usage'],
            properties: {
              role: { type: 'string' },
              name: { type: 'string' },
              hex: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
              usage: { type: 'string' },
            },
          },
        },
        materials: {
          type: 'array',
          items: {
            type: 'object',
            required: ['area', 'material', 'reason'],
            properties: {
              area: { type: 'string' },
              material: { type: 'string' },
              reason: { type: 'string' },
            },
          },
        },
        layout_html: { type: 'string' },
        layout_css: { type: 'string' },
      },
    },
  },
}
