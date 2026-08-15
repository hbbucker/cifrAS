const data = {
  "items": [
    { "id": "1", "title": "A", "originalKey": "C" }
  ],
  "totalCount": 28
};
const items = Array.isArray(data) ? data : data.items || [];
const count = 'totalCount' in data && data.totalCount !== undefined ? data.totalCount : items.length;
console.log(items);
console.log(count);
