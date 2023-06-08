declare class ArrayKeyedMap<K, V> extends Map<K, V> {
    hasPrefix(k: ReadonlyArray<any>): boolean;
}

export = ArrayKeyedMap;