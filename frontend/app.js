// ============================================================
// PIONE SOIL ANALYSIS DAPP - JavaScript
// ============================================================

// Configuration
const API_BASE_URL = 'http://localhost:5000';  // Flask backend
let sensorChart = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateInput').value = today;
    
    // Allow Enter key to trigger analysis
    document.getElementById('dateInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            analyzeDate();
        }
    });
    
    console.log('✅ Dashboard loaded');
});

// Main analysis function
async function analyzeDate() {
    const dateInput = document.getElementById('dateInput').value;
    
    if (!dateInput) {
        showError('Please select a date');
        return;
    }
    
    // Show loading, hide results/errors
    document.getElementById('loadingSpinner').classList.add('active');
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('errorAlert').style.display = 'none';
    
    console.log(`📅 Analyzing date: ${dateInput}`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/analyze-date`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date: dateInput })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Analysis failed');
        }
        
        console.log('✅ Analysis completed:', data);
        
        // Display results
        displayResults(data);
        
    } catch (error) {
        console.error('❌ Error:', error);
        showError(error.message || 'Failed to analyze data. Check if AI service is running.');
    } finally {
        document.getElementById('loadingSpinner').classList.remove('active');
    }
}

// Display results
function displayResults(data) {
    const { date, aggregated_data, ai_analysis } = data;
    
    // Show results container
    document.getElementById('resultsContainer').style.display = 'block';
    
    // Display daily summary
    displayDailySummary(date, aggregated_data);
    
    // Display AI analysis
    if (ai_analysis && !ai_analysis.error) {
        displayAIAnalysis(ai_analysis);
    } else {
        document.querySelector('#resultsContainer .card:last-child').style.display = 'none';
        showError('AI analysis unavailable. Showing data summary only.');
    }
}

// Display daily summary
function displayDailySummary(date, data) {
    // Basic stats
    document.getElementById('sampleCount').textContent = data.sample_count;
    document.getElementById('selectedDate').textContent = date;
    
    // Time range
    const first = new Date(data.time_range.first).toLocaleTimeString('vi-VN');
    const last = new Date(data.time_range.last).toLocaleTimeString('vi-VN');
    document.getElementById('timeRange').textContent = `${first} - ${last}`;
    
    // Average values
    const avg = data.averages;
    document.getElementById('soilTemp').textContent = `${avg.soil_temperature.toFixed(1)}°C`;
    document.getElementById('soilMoisture').textContent = `${avg.soil_moisture.toFixed(1)}%`;
    document.getElementById('phValue').textContent = avg.ph.toFixed(2);
    document.getElementById('ecValue').textContent = `${Math.round(avg.conductivity)} µS/cm`;
    
    // NPK
    document.getElementById('npkValues').textContent = 
        `${Math.round(avg.nitrogen)}-${Math.round(avg.phosphorus)}-${Math.round(avg.potassium)}`;
    
    // Air
    document.getElementById('airValues').textContent = 
        `${avg.air_temperature.toFixed(1)}°C / ${avg.air_humidity.toFixed(1)}%`;
    
    // Rain
    document.getElementById('rainStatus').innerHTML = avg.is_raining 
        ? '<i class="fas fa-cloud-rain text-primary"></i> Raining' 
        : '<i class="fas fa-sun text-warning"></i> No Rain';
    
    // Update chart
    updateSensorChart(avg, data.ranges);
}

// Display AI analysis
function displayAIAnalysis(analysis) {
    // Crop recommendation
    const cropRec = analysis.crop_recommendation;
    document.getElementById('recommendedCrop').textContent = cropRec.best_crop.toUpperCase();
    document.getElementById('cropConfidence').textContent = `${(cropRec.confidence * 100).toFixed(1)}%`;
    
    // Top 3 crops
    const top3Html = cropRec.top_3.map((crop, index) => {
        const percentage = (crop.probability * 100).toFixed(1);
        return `
            <div class="crop-bar">
                <small>${index + 1}. ${crop.crop}</small>
                <div class="crop-bar-fill" style="width: ${percentage}%;">
                    ${percentage}%
                </div>
            </div>
        `;
    }).join('');
    document.getElementById('top3Crops').innerHTML = top3Html;
    
    // Soil health
    const soilHealth = analysis.soil_health;
    document.getElementById('soilHealthScore').textContent = `${soilHealth.overall_score.toFixed(1)}/100`;
    
    const ratingBadge = document.getElementById('soilHealthRating');
    ratingBadge.textContent = soilHealth.rating;
    ratingBadge.className = `badge badge-${soilHealth.rating.toLowerCase()}`;
    
    // Recommendations
    if (analysis.recommendations && analysis.recommendations.length > 0) {
        const recommendationsSection = document.getElementById('recommendationsSection');
        const recommendationsList = document.getElementById('recommendationsList');
        
        const recsHtml = analysis.recommendations.map(rec => {
            return `
                <div class="recommendation-item ${rec.priority}">
                    <span class="priority-badge ${rec.priority}">${rec.priority}</span>
                    <span>${rec.message}</span>
                </div>
            `;
        }).join('');
        
        recommendationsList.innerHTML = recsHtml;
        recommendationsSection.style.display = 'block';
    } else {
        document.getElementById('recommendationsSection').style.display = 'none';
    }
    
    // Anomaly detection
    const anomaly = analysis.anomaly_detection;
    const anomalyAlert = document.getElementById('anomalyAlert');
    
    if (anomaly.is_anomaly) {
        anomalyAlert.className = 'alert alert-danger';
        anomalyAlert.style.display = 'block';
        document.getElementById('anomalyStatus').textContent = 
            `⚠️ Anomaly detected! Score: ${anomaly.anomaly_score.toFixed(4)}`;
    } else {
        anomalyAlert.className = 'alert alert-success';
        anomalyAlert.style.display = 'block';
        document.getElementById('anomalyStatus').textContent = 
            `✅ No anomalies detected. Score: ${anomaly.anomaly_score.toFixed(4)}`;
    }
    
    // Processing time
    document.getElementById('processingTime').textContent = analysis.processing_time_ms.toFixed(2);
}

// Update sensor chart
function updateSensorChart(avg, ranges) {
    const ctx = document.getElementById('sensorChart').getContext('2d');
    
    // Destroy existing chart
    if (sensorChart) {
        sensorChart.destroy();
    }
    
    // Create new chart
    sensorChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Soil Temp (°C)', 'Soil Moisture (%)', 'pH', 'N (mg/kg)', 'P (mg/kg)', 'K (mg/kg)', 'EC (µS/cm)/10', 'Air Temp (°C)'],
            datasets: [{
                label: 'Average Values',
                data: [
                    avg.soil_temperature,
                    avg.soil_moisture,
                    avg.ph * 10,  // Scale up for visibility
                    avg.nitrogen,
                    avg.phosphorus,
                    avg.potassium / 10,  // Scale down
                    avg.conductivity / 10,  // Scale down
                    avg.air_temperature
                ],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.6)',
                    'rgba(23, 162, 184, 0.6)',
                    'rgba(40, 167, 69, 0.6)',
                    'rgba(255, 193, 7, 0.6)',
                    'rgba(220, 53, 69, 0.6)',
                    'rgba(111, 66, 193, 0.6)',
                    'rgba(32, 201, 151, 0.6)',
                    'rgba(253, 126, 20, 0.6)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(23, 162, 184, 1)',
                    'rgba(40, 167, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(220, 53, 69, 1)',
                    'rgba(111, 66, 193, 1)',
                    'rgba(32, 201, 151, 1)',
                    'rgba(253, 126, 20, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Daily Average Sensor Readings',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// Show error
function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    document.getElementById('errorMessage').textContent = message;
    errorAlert.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorAlert.style.display = 'none';
    }, 5000);
}

// Utility: Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ============================================================
// TRIGGER DAILY PIPELINE (Manual test)
// ============================================================

async function triggerDailyPipeline() {
    const dateInput = document.getElementById('dateInput').value;
    
    if (!dateInput) {
        showError('Please select a date');
        return;
    }
    
    // Confirm action
    if (!confirm(`🚀 Trigger full pipeline for ${dateInput}?\n\nThis will:\n1. Aggregate IoT data\n2. Run AI analysis (4 models)\n3. Save to database (daily_insights)\n4. Push to blockchain (Smart Contract)\n\nContinue?`)) {
        return;
    }
    
    // Show loading with custom message
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.innerHTML = `
        <div class="spinner-border text-light" style="width: 3rem; height: 3rem;" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-white mt-3">🚀 Running FULL pipeline...</p>
        <small class="text-white-50">Aggregating → AI (4 models) → Database → Blockchain</small>
    `;
    loadingSpinner.classList.add('active');
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('errorAlert').style.display = 'none';
    
    console.log(`🚀 Triggering FULL PIPELINE for: ${dateInput}`);
    
    try {
        // ⭐ CALL AI SERVICE DIRECTLY (NOT Flask!)
        // This endpoint does EVERYTHING:
        // 1. Aggregates data from sensor_readings
        // 2. Runs AI analysis (4 models)
        // 3. Saves to daily_insights table
        // 4. Pushes to blockchain
        
        const AI_SERVICE_URL = 'http://localhost:8000/api/ai/analyze-daily';
        
        console.log('📊 Calling AI Service /analyze-daily endpoint...');
        const response = await fetch(AI_SERVICE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date: dateInput })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || data.message || 'Pipeline failed');
        }
        
        console.log('✅ Pipeline completed:', data);
        
        // Show success message
        showPipelineSuccess(data);
        
        // Display results (convert format to match displayResults)
        const displayData = {
            date: data.date,
            aggregated_data: {
                sample_count: data.aggregated_data.sample_count,
                time_range: {
                    first: new Date().toISOString(),  // Not critical for display
                    last: new Date().toISOString()
                },
                averages: data.aggregated_data.features,
                ranges: {}  // Not needed for display
            },
            ai_analysis: data.ai_analysis
        };
        displayResults(displayData);
        
    } catch (error) {
        console.error('❌ Pipeline error:', error);
        showError(`Pipeline failed: ${error.message}\n\nCheck:\n- AI Service running? (port 8000)\n- Database accessible?\n- Blockchain node running?`);
    } finally {
        // Restore default loading message
        loadingSpinner.innerHTML = `
            <div class="spinner-border text-light" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-white mt-3">Analyzing soil data...</p>
        `;
        loadingSpinner.classList.remove('active');
    }
}

// Show pipeline success
function showPipelineSuccess(data) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.innerHTML = `
        <h5><i class="fas fa-check-circle"></i> Pipeline Executed Successfully!</h5>
        <p class="mb-2"><strong>Date:</strong> ${data.date}</p>
        <ul class="mb-0">
            <li>✅ Data aggregated (${data.aggregated_data.sample_count} readings)</li>
            <li>✅ AI analysis completed</li>
            <li>✅ Saved to database (daily_insights)</li>
            <li>✅ Pushed to blockchain</li>
        </ul>
        <small class="text-muted mt-2 d-block">
            <i class="fas fa-info-circle"></i> Check blockchain explorer or query API to verify transaction
        </small>
    `;
    
    // Insert before results
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.insertBefore(successDiv, resultsContainer.firstChild);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 10000);
}

console.log('✅ App.js loaded');

