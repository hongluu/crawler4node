/**
    *tham khao https://github.com/bdupras/guava-probably/blob/master/src/main/java/com/duprasville/guava/probably/CuckooFilter.java
    * Space optimization cheat sheet, per CuckooFilter § 5.1 :
    *
    * Given:
    *   n: expected insertions
    *   e: expected false positive probability (e.g. 0.03D for 3% fpp)
    *
    * Choose:
    *   b: bucket size in entries (2, 4, 8)
    *   a: load factor (proportional to b)
    *
    * Calculate:
    *   f: fingerprint size in bits
    *   m: table size in buckets
    *
    *
    * 1) Choose b =     8   | 4 |   2
    *      when e : 0.00001 < e ≤ 0.002
    *      ref: CuckooFilter § 5.1 ¶ 5, "Optimal bucket size"
    *
    * 2) Choose a =  50% | 84% | 95.5% | 98%
    *      when b =   1  |  2  |  4    |  8
    *      ref: CuckooFilter § 5.1 ¶ 2, "(1) Larger buckets improve table occupancy"
    *
    * 2) Optimal f = ceil( log2(2b/e) )
    *    ref: CuckooFilter § 5.1 Eq. (6), "f ≥ log2(2b/e) = [log2(1/e) + log2(2b)]"
    *
    * 3) Required m = evenCeil( ceiling( ceiling( n/a ) / b ) )
    *       Minimum entries (B) = n/a rounded up
    *       Minimum buckets (m) = B/b rounded up to an even number
 */
const { CuckooFilter } = require('bloom-filters')
export default class Filter {

    constructor(option, ) {
        this.MAX_ENTRIES_PER_BUCKET = 32;
        this.MIN_ENTRIES_PER_BUCKET = 8;
        if (option) {
            if (option.isUpdate) {
                this.filter = this._init_update_filter(option.storage_path)
            } else {
                this.filter = this._init_first_filter(option.storage_path)
            }
        }
    }
    _init_update_filter(json_filter_path) {
        return this.create(30000, 0.001);
    }

    _init_first_filter(json_filter_path) {
        try {
            // console.log(json_filter_path)
            let boomfile = require('fs').readFileSync(json_filter_path)
            let exported = JSON.parse(boomfile);
            return CuckooFilter.fromJSON(exported);
        } catch (e) {
            return this.create(30000000, 0.000001);
        }
    }

    has(url) {
        return this.filter.has(url);
    }

    add(url) {
        this.filter.add(url);
    }

    remove(url) {
        this.filter.remove(url);
    }

    saveAsJSON() {
        return this.filter.saveAsJSON();
    }

   /**
    * Returns the optimal number of entries per bucket, or bucket size, ({@code b}) given the
    * expected false positive probability ({@code e}).
    *
    * CuckooFilter § 5.1 ¶ 5, "Optimal bucket size"
    *
    * @param e the desired false positive probability (must be positive and less than 1.0)
    * @return optimal number of entries per bucket
    */
    
    optimalEntriesPerBucket(e) {
        // 1>e >0.0;
        if (e <= 0.00001) {
            return this.MAX_ENTRIES_PER_BUCKET;
        } else if (e <= 0.002) {
            return this.MAX_ENTRIES_PER_BUCKET / 2;
        } else {
            return this.MIN_ENTRIES_PER_BUCKET;
        }
    }

   /**
    *
    * CuckooFilter § 5.1 ¶ 2, "(1) Larger buckets improve table occupancy"
    *
    * @param b number of entries per bucket
    * @return load factor, positive and less than 1.0
    */
    
    optimalLoadFactor(b) {
        if (b == 2) {
            return 0.84;
        } else if (b == 4) {
            return 0.955;
        } else {
            return 0.98;
        }
    }

    /**
     * CuckooFilter § 5.1 Eq. (6), "f ≥ log2(2b/e) = [log2(1/e) + log2(2b)]"
     *
     * @param e the desired false positive probability (must be positive and less than 1.0)
     * @param b number of entries per bucket
     * @return number of bits per entry (fingerprint size in bits)
     */

    optimalBitsPerEntry(e, b) {
        return Math.floor(Math.log2(2 * b / e));
    }

    /**
    * Returns the minimal required number of buckets given the expected insertions {@code n}, and the
    * number of entries per bucket ({@code b}).
    *
    * @param n the number of expected insertions
    * @param b number of entries per bucket
    * @return number of buckets
    */
    optimalNumberOfBuckets(n, b) {
        return Math.round(
                this.evenCeil(
                     Math.round(Math.ceil(n / this.optimalLoadFactor(b)) / b)
                )
            );
    }
    evenCeil(n) {
        return (n + 1) / 2 * 2;
    }

    /**
     * 
     * @param capacity the number of expected insertions to the constructed {@link CuckooFilter}; must be positive
     *                
     * @return a {@link CuckooFilter}
     */

    create(capacity, fpp) {
        let numEntriesPerBucket = this.optimalEntriesPerBucket(fpp);
        let numBuckets = this.optimalNumberOfBuckets(capacity, numEntriesPerBucket);
        let numBitsPerEntry = this.optimalBitsPerEntry(fpp, numEntriesPerBucket);
        // console.log(numBuckets);
        return new CuckooFilter(numBuckets, numBitsPerEntry, numEntriesPerBucket);
    };
}