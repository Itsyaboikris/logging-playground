"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_prom_bundle_1 = __importDefault(require("express-prom-bundle"));
const promClient = __importStar(require("prom-client"));
const systeminformation_1 = __importDefault(require("systeminformation"));
const child_process_1 = require("child_process");
const app = (0, express_1.default)();
const metricsMiddleWare = (0, express_prom_bundle_1.default)({ includeMethod: true });
// resource Utilization Metrics
const cpuUsage = new promClient.Gauge({
    name: 'cpu_usage_percent',
    help: 'CPU Usage Percentage'
});
const memoryUsage = new promClient.Gauge({
    name: 'memory_usage_bytes',
    help: 'Memory Usage in Bytes'
});
const diskUsage = new promClient.Gauge({
    name: 'disk_usage_percentage',
    help: 'Disk Usage Percentage'
});
// HTTP Request Metrics
const httpRequestCounter = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP Requests',
    labelNames: ['method', 'path', 'status']
});
// Custom Business Metrics
const activeUsers = new promClient.Gauge({
    name: 'app_active_users',
    help: 'Number of active users'
});
// Error Rate Metrics
const errorCounter = new promClient.Counter({
    name: 'app_error_total',
    help: 'Number Application Errors'
});
// Set up metrics middleware
app.use(metricsMiddleWare);
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cpuData = yield systeminformation_1.default.currentLoad();
    const currentCpuUsage = cpuData.currentLoad;
    cpuUsage.set(currentCpuUsage);
    memoryUsage.set(process.memoryUsage().rss);
    (0, child_process_1.exec)('df -k', (err, stdout, stderr) => {
        if (err) {
            throw (err);
        }
        const diskInfo = stdout.split('\n')[1].split(/\s+/);
        const totalSapce = parseInt(diskInfo[1]);
        const usedDiskSpace = parseInt(diskInfo[2]);
        const diskUsagePercentage = (usedDiskSpace / totalSapce) * 100;
        diskUsage.set(diskUsagePercentage);
    });
    httpRequestCounter.labels('GET', '/', '200').inc();
    activeUsers.set(Math.floor(Math.random() * 100));
    if (Math.random() < 0.1) {
        errorCounter.inc();
        throw new Error('Simulated error');
    }
    res.send("Hello Prometheus!");
}));
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
