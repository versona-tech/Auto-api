export interface PostmanCollection {
  info: {
    _postman_id: string;
    name: string;
    schema: string;
    _exporter_id?: string;
  };
  item: PostmanItem[];
}

export interface PostmanItem {
  name: string;
  request: {
    method: string;
    header: any[];
    url: {
      raw: string;
      host: string[];
      path: string[];
      query?: { key: string; value: string }[];
    };
    description?: string;
  };
  response: any[];
}

const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

export function generatePostmanCollection(code: string): PostmanCollection {
  const collection: PostmanCollection = {
    info: {
      _postman_id: uuid(),
      name: 'AutoAPI Generated Collection',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [],
  };

  const swaggerRegex = /\/\*\*([\s\S]*?)\*\//g;
  let match;

  while ((match = swaggerRegex.exec(code)) !== null) {
    const commentBlock = match[1];
    if (!commentBlock.includes('@swagger')) continue;

    try {
      const pathRegex = /^\s*\*\s*(\/.*?):/m;
      const methodRegex = /^\s*\*\s*(get|post|put|delete|patch|options|head):/m;
      const summaryRegex = /^\s*\*\s*summary:\s*(.*)/m;
      
      const pathMatch = commentBlock.match(pathRegex);
      const methodMatch = commentBlock.match(methodRegex);
      const summaryMatch = commentBlock.match(summaryRegex);

      if (pathMatch && methodMatch) {
        const fullPath = pathMatch[1].trim();
        const method = methodMatch[1].trim().toUpperCase();
        const summary = summaryMatch ? summaryMatch[1].trim().replace(/['"]+/g, '') : fullPath;
        
        const [pathPart, queryPart] = fullPath.split('?');
        const pathSegments = pathPart.startsWith('/') ? pathPart.substring(1).split('/') : pathPart.split('/');

        const queryParams = queryPart 
          ? queryPart.split('&').map(param => {
              const [key, value = ''] = param.split('=');
              return { key, value };
            })
          : [];

        const item: PostmanItem = {
          name: summary,
          request: {
            method: method,
            header: [],
            url: {
              raw: `{{baseUrl}}${fullPath}`,
              host: ['{{baseUrl}}'],
              path: pathSegments,
            },
          },
          response: [],
        };
        
        if (queryParams.length > 0) {
          item.request.url.query = queryParams;
        }

        collection.item.push(item);
      }
    } catch (e) {
      console.warn("Could not parse a comment block:", e);
    }
  }

  return collection;
}
