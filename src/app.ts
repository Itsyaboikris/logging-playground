import express from "express";
import promBundle from "express-prom-bundle";
import * as promClient from "prom-client";
import si from 'systeminformation';
import {exec} from 'child_process';

const app = express();
const metricsMiddleWare = promBundle({includeMethod: true});

// resource Utilization Metrics
const cpuUsage = new promClient.Gauge({
    name: 'cpu_usage_percent',
    help: 'CPU Usage Percentage'
})

const memoryUsage = new promClient.Gauge({
    name: 'memory_usage_bytes',
    help: 'Memory Usage in Bytes'
})

const diskUsage = new promClient.Gauge({
    name: 'disk_usage_percentage',
    help: 'Disk Usage Percentage'
})

// HTTP Request Metrics
const httpRequestCounter = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP Requests',
    labelNames: ['method', 'path', 'status']
})

// Custom Business Metrics
const activeUsers = new promClient.Gauge({
    name: 'app_active_users',
    help: 'Number of active users'
})

// Error Rate Metrics
const errorCounter = new promClient.Counter({
    name: 'app_error_total',
    help: 'Number Application Errors'
})



// Set up metrics middleware
app.use(metricsMiddleWare)

app.get('/', async (req, res) => {
    const cpuData = await si.currentLoad();
    const currentCpuUsage = cpuData.currentLoad
    cpuUsage.set(currentCpuUsage)

    memoryUsage.set(process.memoryUsage().rss)

    exec('df -k', (err, stdout, stderr) => {
        if (err) {
            throw(err)
        }

        const diskInfo = stdout.split('\n')[1].split(/\s+/);
        const totalSapce = parseInt(diskInfo[1])
        const usedDiskSpace = parseInt(diskInfo[2])
        const diskUsagePercentage = (usedDiskSpace/totalSapce) * 100;
        diskUsage.set(diskUsagePercentage)
    })
    
    
    httpRequestCounter.labels('GET', '/', '200').inc()

    activeUsers.set(Math.floor(Math.random() * 100))

    // if (Math.random() < 0.1) {
    //     errorCounter.inc();
    //     throw new Error('Simulated error')
    // }

    res.send("Hello Prometheus!")
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})