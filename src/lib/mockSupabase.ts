// Mock Supabase Client for local development and testing

// Types for Mock Data
interface MockUser {
    id: string;
    email: string;
    user_metadata: any;
    app_metadata: any;
    aud: string;
    created_at: string;
}

interface MockSession {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    user: MockUser;
}

// Local Storage Keys
const STORAGE_KEY_USERS = 'mock_supabase_users';
const STORAGE_KEY_SESSION = 'mock_supabase_session';
const STORAGE_KEY_DB = 'mock_supabase_db';

class MockSupabaseClient {
    private authListeners: Function[] = [];

    constructor() {
        console.log('Using Mock Supabase Client');
        this.initializeDatabase();
    }

    private initializeDatabase() {
        if (!localStorage.getItem(STORAGE_KEY_DB)) {
            localStorage.setItem(STORAGE_KEY_DB, JSON.stringify({
                profiles: [],
                trips: [],
                bookings: []
            }));
        }
        if (!localStorage.getItem(STORAGE_KEY_USERS)) {
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([]));
        }
    }

    // --- Auth Namespace ---
    auth = {
        signUp: async ({ email, password, options }: any) => {
            console.log('Mock SignUp:', email);

            const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
            if (users.find((u: any) => u.email === email)) {
                return { data: { user: null, session: null }, error: { message: 'User already exists' } };
            }

            const newUser: MockUser = {
                id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
                email,
                user_metadata: options?.data || {},
                app_metadata: {},
                aud: 'authenticated',
                created_at: new Date().toISOString()
            };

            users.push({ ...newUser, password }); // Insecurely storing password for mock convenience
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

            // Auto login on signup
            const session = this.createSession(newUser);
            this.saveSession(session);
            this.notifyListeners('SIGNED_IN', session);

            return { data: { user: newUser, session }, error: null };
        },

        signInWithPassword: async ({ email, password }: any) => {
            console.log('Mock SignIn:', email);

            const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
            const user = users.find((u: any) => u.email === email && u.password === password);

            if (!user) {
                return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
            }

            const { password: _, ...safeUser } = user;
            const session = this.createSession(safeUser);
            this.saveSession(session);
            this.notifyListeners('SIGNED_IN', session);

            return { data: { user: safeUser, session }, error: null };
        },

        signInWithOAuth: async ({ provider }: any) => {
            console.log(`Mock OAuth SignIn with ${provider}`);
            // Simulate a successful OAuth login after a delay
            const newUser: MockUser = {
                id: 'mock-oauth-user-' + Math.random().toString(36).substr(2, 9),
                email: `mock_${provider}_user@example.com`,
                user_metadata: { full_name: `Mock ${provider} User` },
                app_metadata: {},
                aud: 'authenticated',
                created_at: new Date().toISOString()
            };
            const session = this.createSession(newUser);
            this.saveSession(session);
            this.notifyListeners('SIGNED_IN', session);
            return { data: { url: window.location.href }, error: null };
        },

        signOut: async () => {
            console.log('Mock SignOut');
            localStorage.removeItem(STORAGE_KEY_SESSION);
            this.notifyListeners('SIGNED_OUT', null);
            return { error: null };
        },

        getSession: async () => {
            const sessionStr = localStorage.getItem(STORAGE_KEY_SESSION);
            const session = sessionStr ? JSON.parse(sessionStr) : null;
            return { data: { session }, error: null };
        },

        onAuthStateChange: (callback: Function) => {
            this.authListeners.push(callback);
            return {
                data: {
                    subscription: {
                        unsubscribe: () => {
                            this.authListeners = this.authListeners.filter(cb => cb !== callback);
                        }
                    }
                }
            };
        }
    };

    // --- Database Namespace (Query Builder Mock) ---
    from(table: string) {
        return new MockQueryBuilder(table);
    }

    // Helpers
    private createSession(user: MockUser): MockSession {
        return {
            access_token: 'mock-access-token-' + Date.now(),
            refresh_token: 'mock-refresh-token-' + Date.now(),
            expires_in: 3600,
            token_type: 'bearer',
            user
        };
    }

    private saveSession(session: MockSession) {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    }

    private notifyListeners(event: string, session: any) {
        this.authListeners.forEach(cb => cb(event, session));
    }

    resetDatabase() {
        localStorage.removeItem(STORAGE_KEY_DB);
        localStorage.removeItem(STORAGE_KEY_USERS);
        localStorage.removeItem(STORAGE_KEY_SESSION);
        this.initializeDatabase();
        window.location.reload();
    }
}

class MockQueryBuilder {
    private table: string;
    private filters: any[] = [];
    private _single = false;
    private _select = '*';
    private _order: { column: string, ascending: boolean } | null = null;
    private _limit: number | null = null;

    constructor(table: string) {
        this.table = table;
    }

    select(columns = '*') {
        this._select = columns;
        return this;
    }

    eq(column: string, value: any) {
        this.filters.push({ type: 'eq', column, value });
        return this;
    }

    single() {
        this._single = true;
        return this;
    }

    order(column: string, { ascending = true } = {}) {
        this._order = { column, ascending };
        return this;
    }

    limit(count: number) {
        this._limit = count;
        return this;
    }

    ilike(column: string, pattern: string) {
        this.filters.push({ type: 'ilike', column, value: pattern.replace(/%/g, '') });
        return this;
    }

    or(filterStr: string) {
        // Simple mock implementation of OR: sender_id.eq.xxx,recipient_id.eq.xxx
        const parts = filterStr.split(',');
        const orFilters = parts.map(p => {
            const [col, op, val] = p.split('.');
            return { column: col, value: val };
        });
        this.filters.push({ type: 'or', filters: orFilters });
        return this;
    }

    gte(column: string, value: any) {
        this.filters.push({ type: 'gte', column, value });
        return this;
    }

    async insert(data: any | any[]) {
        console.log(`Mock DB Insert into ${this.table}:`, data);
        const db = this.getDb();
        if (!db[this.table]) db[this.table] = [];

        const items = Array.isArray(data) ? data : [data];
        items.forEach(item => {
            // simple ID generation if not provided
            if (!item.id) item.id = Math.random().toString(36).substr(2, 9);
            db[this.table].push(item)
        });

        this.saveDb(db);
        return { data: Array.isArray(data) ? items : items[0], error: null };
    }

    async upsert(data: any | any[]) {
        console.log(`Mock DB Upsert into ${this.table}:`, data);
        const db = this.getDb();
        if (!db[this.table]) db[this.table] = [];

        const items = Array.isArray(data) ? data : [data];
        items.forEach(item => {
            const index = db[this.table].findIndex((r: any) => r.id === item.id);
            if (index !== -1) {
                db[this.table][index] = { ...db[this.table][index], ...item };
            } else {
                if (!item.id) item.id = Math.random().toString(36).substr(2, 9);
                db[this.table].push(item);
            }
        });

        this.saveDb(db);
        return { data: Array.isArray(data) ? items : items[0], error: null };
    }

    async update(data: any) {
        console.log(`Mock DB Update ${this.table}:`, data);
        const db = this.getDb();
        let rows = db[this.table] || [];

        // Apply filters to find rows to update
        let updatedRows = [];
        rows = rows.map((row: any) => {
            if (this.matchesFilters(row)) {
                const updated = { ...row, ...data };
                updatedRows.push(updated);
                return updated;
            }
            return row;
        });

        db[this.table] = rows;
        this.saveDb(db);

        return { data: updatedRows, error: null };
    }

    // Execution (simulating thenable)
    async then(resolve: Function, reject: Function) {
        const db = this.getDb();
        let rows = db[this.table] || [];

        // Apply filters
        rows = rows.filter((row: any) => this.matchesFilters(row));

        // Apply ordering
        if (this._order) {
            const { column, ascending } = this._order;
            rows.sort((a, b) => {
                if (a[column] < b[column]) return ascending ? -1 : 1;
                if (a[column] > b[column]) return ascending ? 1 : -1;
                return 0;
            });
        }

        // Apply limit
        if (this._limit !== null) {
            rows = rows.slice(0, this._limit);
        }

        let result;
        if (this._single) {
            result = rows.length > 0 ? rows[0] : null;
            // Simulate Postgres error for single() when no rows found
            if (!result) {
                resolve({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });
                return;
            }
        } else {
            result = rows;
        }

        // Apply simulated joins
        if (result && this._select !== '*') {
            result = this.applyJoins(result, this._select);
        }

        resolve({ data: result, error: null });
    }

    private applyJoins(data: any | any[], selectStr: string) {
        const isArray = Array.isArray(data);
        const rows = isArray ? data : [data];

        // Very basic parser for joins: "*, trip:trips(*, driver:profiles(*))"
        // This is a simplified mock implementation
        const processedRows = rows.map(row => {
            const newRow = { ...row };

            // Handle trip:trips join
            if (selectStr.includes('trip:trips') || selectStr.includes('trips(')) {
                const tripId = row.trip_id;
                if (tripId) {
                    const db = this.getDb();
                    const trip = (db['trips'] || []).find((t: any) => t.id === tripId);
                    if (trip) {
                        newRow.trip = { ...trip };
                        // Handle driver join inside trip
                        if (selectStr.includes('driver:profiles') || selectStr.includes('driver(')) {
                            const driver = (db['profiles'] || []).find((p: any) => p.id === trip.driver_id);
                            if (driver) newRow.trip.driver = driver;
                        }
                    }
                }
            }

            // Handle driver:profiles join directly
            if ((selectStr.includes('driver:profiles') || selectStr.includes('driver(')) && !newRow.trip) {
                const driverId = row.driver_id;
                if (driverId) {
                    const db = this.getDb();
                    const driver = (db['profiles'] || []).find((p: any) => p.id === driverId);
                    if (driver) newRow.driver = driver;
                }
            }

            // Handle passenger:profiles join
            if (selectStr.includes('passenger:profiles') || selectStr.includes('passenger(')) {
                const passengerId = row.passenger_id;
                if (passengerId) {
                    const db = this.getDb();
                    const passenger = (db['profiles'] || []).find((p: any) => p.id === passengerId);
                    if (passenger) newRow.passenger = passenger;
                }
            }

            // Handle profiles join for messages
            if (this.table === 'messages' && (selectStr.includes('sender') || selectStr.includes('recipient'))) {
                const db = this.getDb();
                if (row.sender_id) newRow.sender = (db['profiles'] || []).find((p: any) => p.id === row.sender_id);
                if (row.recipient_id) newRow.recipient = (db['profiles'] || []).find((p: any) => p.id === row.recipient_id);
            }

            return newRow;
        });

        return isArray ? processedRows : processedRows[0];
    }

    private matchesFilters(row: any) {
        return this.filters.every(filter => {
            if (filter.type === 'eq') return row[filter.column] === filter.value;
            if (filter.type === 'gte') return row[filter.column] >= filter.value;
            if (filter.type === 'ilike') return String(row[filter.column] || '').toLowerCase().includes(filter.value.toLowerCase());
            if (filter.type === 'or') {
                return filter.filters.some((f: any) => row[f.column] === f.value);
            }
            return true;
        });
    }

    private getDb() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_DB) || '{}');
    }

    private saveDb(db: any) {
        localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(db));
    }
}

export const createMockClient = () => new MockSupabaseClient();
