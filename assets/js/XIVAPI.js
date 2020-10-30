import Settings from './Settings';

class XIVAPI
{
    get(endpoint, queries, callback)
    {
        queries = queries ? queries : {};
        queries.language = Settings.getLanguage();

        let query = Object.keys(queries)
            .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(queries[k]))
            .join('&');

        endpoint = endpoint +'?'+ query;

        fetch(`https://xivapi.com${endpoint}`, { mode: 'cors' })
            .then(response => response.json())
            .then(callback)
    }

    /**
     * Fuse the results of two searches, calling the provided callback after the second search is provided.
     */
    fuse(callback) {
        let json1, json2;
        return (json) => {
            if (!json1) {
                json1 = json;
                return;
            } else {
                json2 = json;
                const fusedJson = json1;

                fusedJson.Results = json1.Results
                    .concat(json2.Results)
                    .filter((result, i, array) => {
                        const firstI = array
                            .reverse()
                            .findIndex(item => item.ID === result.ID);
                        return i === firstI;
                    });

                callback(fusedJson);
            }
        };
    }

    /**
     * Search for an item
     */
    search(string, callback) {
        const fusedCb = this.fuse(callback);

        const params1 = {
            indexes:     'item',
            filters:     'ItemSearchCategory.ID>=1',
            columns:     'ID,Icon,Name,LevelItem,Rarity,ItemSearchCategory.Name,ItemSearchCategory.ID,ItemKind.Name',
            string:      string.trim(),
            limit:        100,
            sort_field:  'LevelItem',
            sort_order:  'desc'
        };

        const params2 = {
            ...params1,
            string_algo: 'fuzzy',
        };

        this.get(`/search`, params1, fusedCb);
        this.get(`/search`, params2, fusedCb);
    }

    /**
     * A limited search
     */
    searchLimited(string, callback) {
        const fusedCb = this.fuse(callback);

        const params1 = {
            indexes:     'item',
            filters:     'ItemSearchCategory.ID>=1',
            columns:     'ID,Name',
            string:      string.trim(),
            limit:       10,
        };

        const params2 = {
            ...params1,
            string_algo: 'fuzzy',
        };

        this.get(`/search`, params1, fusedCb);
        this.get(`/search`, params2, fusedCb);
    }

    /**
     * Search for a character
     */
    searchCharacter(name, server, callback) {
        this.get(`/character/search`, {
            name: name,
            server: server
        }, callback);
    }

    /**
     * Get a specific character
     */
    getCharacter(lodestoneId, callback) {
        this.get(`/character/${lodestoneId}`, {}, callback);
    }

    /**
     * Confirm character verification state
     */
    characterVerification(lodestoneId, token, callback) {
        this.get(`/character/${lodestoneId}/verification`, {
            token: token
        }, callback);
    }

    /**
     * Return information about an item
     */
    getItem(itemId, callback) {
        this.get(`/Item/${itemId}`, {}, callback);
    }

    /**
     * Get a list of servers grouped by their data center
     */
    getServerList(callback) {
        fetch(`https://universalis.app/json/dc.json`, { mode: 'cors' })
            .then(response => response.json())
            .then(callback)
    }

    /**
     *
     */
    getMarketPrices(itemId, server, callback)
    {
        const options = {
            columns: 'Prices,Item',
            servers: server,
        };

        this.get(`/market/item/${itemId}`, options, callback);
    }
}

export default new XIVAPI;
