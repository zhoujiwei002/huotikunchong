"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
exports.getSupabaseCredentials = getSupabaseCredentials;
exports.getSupabaseClient = getSupabaseClient;
var supabase_js_1 = require("@supabase/supabase-js");
var child_process_1 = require("child_process");
var envLoaded = false;
function loadEnv() {
    if (envLoaded || (process.env.COZE_SUPABASE_URL && process.env.COZE_SUPABASE_ANON_KEY)) {
        return;
    }
    try {
        try {
            require('dotenv').config();
            if (process.env.COZE_SUPABASE_URL && process.env.COZE_SUPABASE_ANON_KEY) {
                envLoaded = true;
                return;
            }
        }
        catch (_a) {
            // dotenv not available
        }
        var pythonCode = "\nimport os\nimport sys\ntry:\n    from coze_workload_identity import Client\n    client = Client()\n    env_vars = client.get_project_env_vars()\n    client.close()\n    for env_var in env_vars:\n        print(f\"{env_var.key}={env_var.value}\")\nexcept Exception as e:\n    print(f\"# Error: {e}\", file=sys.stderr)\n";
        var output = (0, child_process_1.execSync)("python3 -c '".concat(pythonCode.replace(/'/g, "'\"'\"'"), "'"), {
            encoding: 'utf-8',
            timeout: 10000,
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        var lines = output.trim().split('\n');
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            if (line.startsWith('#'))
                continue;
            var eqIndex = line.indexOf('=');
            if (eqIndex > 0) {
                var key = line.substring(0, eqIndex);
                var value = line.substring(eqIndex + 1);
                if ((value.startsWith("'") && value.endsWith("'")) ||
                    (value.startsWith('"') && value.endsWith('"'))) {
                    value = value.slice(1, -1);
                }
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        }
        envLoaded = true;
    }
    catch (_b) {
        // Silently fail
    }
}
function getSupabaseCredentials() {
    loadEnv();
    var url = process.env.COZE_SUPABASE_URL;
    var anonKey = process.env.COZE_SUPABASE_ANON_KEY;
    if (!url) {
        throw new Error('COZE_SUPABASE_URL is not set');
    }
    if (!anonKey) {
        throw new Error('COZE_SUPABASE_ANON_KEY is not set');
    }
    return { url: url, anonKey: anonKey };
}
function getSupabaseClient(token) {
    var _a = getSupabaseCredentials(), url = _a.url, anonKey = _a.anonKey;
    if (token) {
        return (0, supabase_js_1.createClient)(url, anonKey, {
            global: {
                headers: { Authorization: "Bearer ".concat(token) },
            },
            db: {
                timeout: 60000,
            },
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    return (0, supabase_js_1.createClient)(url, anonKey, {
        db: {
            timeout: 60000,
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
