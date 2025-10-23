import { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';

export default function useLocalSearch(items: any[]) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>(items);
  const fuseRef = useRef<Fuse<any> | null>(null);

  useEffect(() => {
    fuseRef.current = new Fuse(items, { keys: ['title', 'tags', 'venue.name'], threshold: 0.3 });
    setResults(items);
  }, [items]);

  useEffect(() => {
    if (!query) setResults(items);
    else setResults(fuseRef.current?.search(query).map(r => r.item) || []);
  }, [query, items]);

  return { query, setQuery, results };
}
