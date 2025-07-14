// Health Metrics Calculator JavaScript
// Global variable to store current results
let currentResults = null;
let scenarioResults = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Timeline preference change handler
    const timelineSelect = document.getElementById('timelinePreference');
    const customTimelineInput = document.getElementById('customTimeline');
    
    timelineSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customTimelineInput.disabled = false;
            customTimelineInput.required = true;
        } else {
            customTimelineInput.disabled = true;
            customTimelineInput.required = false;
            customTimelineInput.value = '';
        }
    });
});

// Tab switching functionality
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + '-tab').classList.add('active');
}

// Navigation function for next step
function nextStep() {
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    
    if (!age || !gender) {
        alert('Please complete all required fields.');
        return;
    }
    switchTab('metrics');
}

// Main calculation function
function calculateResults() {
    // Validate required fields
    const heightFeet = document.getElementById('heightFeet').value;
    const heightInches = document.getElementById('heightInches').value;
    const weight = document.getElementById('weight').value;
    const activityLevel = document.getElementById('activityLevel').value;
    
    if (!heightFeet || !heightInches || !weight || !activityLevel) {
        alert('Please complete all required fields.');
        return;
    }

    // Calculate basic metrics first
    calculateBasicMetrics();
    displayResults();
    switchTab('results');
}

// Calculate basic health metrics
function calculateBasicMetrics() {
    const totalHeightInches = (parseInt(document.getElementById('heightFeet').value) * 12) + parseInt(document.getElementById('heightInches').value);
    const weightNum = parseFloat(document.getElementById('weight').value);
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const activityNum = parseFloat(document.getElementById('activityLevel').value);
    const bodyFat = parseFloat(document.getElementById('bodyFat').value) || null;
    const restingHR = parseFloat(document.getElementById('restingHR').value) || null;
    const fullName = document.getElementById('fullName').value || 'Client';

    // BMI calculation - (Body Weight x 703)/Height^2
    const bmi = (weightNum * 703) / (totalHeightInches * totalHeightInches);

    // RMR calculation - Body Weight x 11
    const rmr = weightNum * 11;

    // Total daily calories - RMR * Activity Level
    const totalCalories = rmr * activityNum;

    // Skeletal muscle mass calculation (more accurate formula from document)
    let smm;
    let currentSMM; // Actual muscle mass in lbs
    if (bodyFat) {
        // If body fat is known, calculate lean body mass
        const leanBodyMass = weightNum * (100 - bodyFat) / 100;
        currentSMM = leanBodyMass * 0.85; // SMM is about 85% of lean body mass
        smm = (currentSMM / weightNum) * 100; // SMM/Body Weight
    } else {
        // Estimate based on gender and age
        smm = gender === 'male' ? Math.max(30, 50 - (age - 20) * 0.1) : Math.max(25, 45 - (age - 20) * 0.1);
        currentSMM = (smm / 100) * weightNum;
    }

    // Protein needs - Base Need = SMM * 1.5
    const proteinNeeds = currentSMM * 1.5;

    // Heart Rate calculations
    let maxHR = 220 - age;
    let hrReserve = null;
    let trainingZones = null;
    
    if (restingHR) {
        // Heart Rate Reserve = (220 - Age) - Resting HR
        hrReserve = maxHR - restingHR;
        
        // Training zones based on HRR percentages
        trainingZones = {
            zone1: { 
                min: Math.round(hrReserve * 0.5 + restingHR), 
                max: Math.round(hrReserve * 0.6 + restingHR) 
            },
            zone2: { 
                min: Math.round(hrReserve * 0.6 + restingHR), 
                max: Math.round(hrReserve * 0.7 + restingHR) 
            },
            zone3: { 
                min: Math.round(hrReserve * 0.7 + restingHR), 
                max: Math.round(hrReserve * 0.8 + restingHR) 
            },
            zone4: { 
                min: Math.round(hrReserve * 0.8 + restingHR), 
                max: Math.round(hrReserve * 0.9 + restingHR) 
            },
            zone5: { 
                min: Math.round(hrReserve * 0.9 + restingHR), 
                max: maxHR 
            }
        };
    }

    // Calculate ideal weight ranges for different BMI targets
    const heightSquared = totalHeightInches * totalHeightInches;
    
    // Healthy range: BMI 23-25 (from document)
    const idealWeightHealthy = {
        min: Math.round((heightSquared * 23) / 703),
        max: Math.round((heightSquared * 25) / 703)
    };
    
    // Athletic range: BMI 25-29 (from document)
    const idealWeightAthletic = {
        min: Math.round((heightSquared * 25) / 703),
        max: Math.round((heightSquared * 29) / 703)
    };

    // Store all calculated results
    currentResults = {
        fullName, totalHeightInches, weight: weightNum, age, gender, bmi, rmr, totalCalories, 
        smm, currentSMM, proteinNeeds, bodyFat, restingHR, maxHR, hrReserve, trainingZones,
        idealWeightHealthy, idealWeightAthletic
    };
}

// Enhanced scenario generation function
function generateScenarios() {
    // First calculate basic metrics if not already done
    if (!currentResults) {
        calculateBasicMetrics();
    }

    const primaryGoal = document.getElementById('primaryGoal').value;
    const goalWeight = parseFloat(document.getElementById('goalWeight').value);
    const goalBodyFat = parseFloat(document.getElementById('goalBodyFat').value) || null;
    const timelinePreference = document.getElementById('timelinePreference').value;
    const customTimeline = parseInt(document.getElementById('customTimeline').value);
    const sustainableDeficit = parseInt(document.getElementById('sustainableDeficit').value);
    const aggressiveDeficit = parseInt(document.getElementById('aggressiveDeficit').value);

    if (!primaryGoal || !goalWeight) {
        alert('Please set your primary goal and target weight.');
        return;
    }

    // Get selected workout frequencies
    const workoutFrequencies = [];
    if (document.getElementById('workout2x').checked) workoutFrequencies.push(2);
    if (document.getElementById('workout3x').checked) workoutFrequencies.push(3);
    if (document.getElementById('workout4x').checked) workoutFrequencies.push(4);
    if (document.getElementById('workout5x').checked) workoutFrequencies.push(5);
    if (document.getElementById('workout6x').checked) workoutFrequencies.push(6);

    // Determine target timeline in months
    let targetMonths;
    if (timelinePreference === 'custom') {
        targetMonths = customTimeline;
    } else {
        targetMonths = parseInt(timelinePreference);
    }

    // Calculate scenarios
    scenarioResults = calculateAllScenarios(currentResults, {
        primaryGoal,
        goalWeight,
        goalBodyFat,
        targetMonths,
        sustainableDeficit,
        aggressiveDeficit,
        workoutFrequencies
    });

    displayScenariosInResults();
    
    // Show success message
    alert(`Generated ${scenarioResults.scenarios.length} scenarios! Check the results tab to see all options.`);
}

// Calculate all scenarios with different approaches
function calculateAllScenarios(baseData, goals) {
    const scenarios = [];
    const currentWeight = baseData.weight;
    const currentRMR = baseData.rmr;
    const weightDifference = Math.abs(currentWeight - goals.goalWeight);
    const isWeightLoss = currentWeight > goals.goalWeight;

    // Scenario 1: Diet Only (Sustainable)
    const dietOnlySustainable = calculateScenario({
        name: "Diet Only (Sustainable)",
        approach: "sustainable",
        dailyDeficit: goals.sustainableDeficit,
        workoutFreq: 0,
        workoutCalories: 0,
        currentWeight,
        goalWeight: goals.goalWeight,
        currentRMR,
        targetMonths: goals.targetMonths,
        isWeightLoss
    });
    scenarios.push(dietOnlySustainable);

    // Scenario 2: Diet Only (Aggressive)
    const dietOnlyAggressive = calculateScenario({
        name: "Diet Only (Aggressive)",
        approach: "aggressive",
        dailyDeficit: goals.aggressiveDeficit,
        workoutFreq: 0,
        workoutCalories: 0,
        currentWeight,
        goalWeight: goals.goalWeight,
        currentRMR,
        targetMonths: goals.targetMonths,
        isWeightLoss
    });
    scenarios.push(dietOnlyAggressive);

    // Scenarios 3+: Diet + Exercise combinations
    goals.workoutFrequencies.forEach(freq => {
        // Estimate calories burned per workout (varies by intensity and person)
        const caloriesPerWorkout = estimateWorkoutCalories(baseData.weight, baseData.gender);
        const weeklyWorkoutCalories = caloriesPerWorkout * freq;
        const dailyWorkoutCalories = weeklyWorkoutCalories / 7;

        // Sustainable + Exercise
        const sustainableWithExercise = calculateScenario({
            name: `Sustainable + ${freq}x/week Exercise`,
            approach: "sustainable",
            dailyDeficit: goals.sustainableDeficit,
            workoutFreq: freq,
            workoutCalories: dailyWorkoutCalories,
            currentWeight,
            goalWeight: goals.goalWeight,
            currentRMR,
            targetMonths: goals.targetMonths,
            isWeightLoss
        });
        scenarios.push(sustainableWithExercise);

        // Aggressive + Exercise (only for higher frequencies)
        if (freq >= 3) {
            const aggressiveWithExercise = calculateScenario({
                name: `Aggressive + ${freq}x/week Exercise`,
                approach: "aggressive",
                dailyDeficit: goals.aggressiveDeficit,
                workoutFreq: freq,
                workoutCalories: dailyWorkoutCalories,
                currentWeight,
                goalWeight: goals.goalWeight,
                currentRMR,
                targetMonths: goals.targetMonths,
                isWeightLoss
            });
            scenarios.push(aggressiveWithExercise);
        }
    });

    return {
        primaryGoal: goals.primaryGoal,
        currentWeight,
        goalWeight: goals.goalWeight,
        targetMonths: goals.targetMonths,
        scenarios: scenarios.sort((a, b) => a.timeToGoalWeeks - b.timeToGoalWeeks)
    };
}

// Calculate individual scenario
function calculateScenario(params) {
    const {
        name, approach, dailyDeficit, workoutFreq, workoutCalories,
        currentWeight, goalWeight, currentRMR, targetMonths, isWeightLoss
    } = params;

    // Total daily deficit (diet + exercise)
    const totalDailyDeficit = dailyDeficit + workoutCalories;
    
    // Weekly deficit
    const weeklyDeficit = totalDailyDeficit * 7;
    
    // Weekly weight change (3500 calories = 1 pound)
    const weeklyWeightChange = weeklyDeficit / 3500;
    
    // Weight difference to achieve
    const weightDifference = Math.abs(currentWeight - goalWeight);
    
    // Time to goal in weeks
    const timeToGoalWeeks = weightDifference / weeklyWeightChange;
    const timeToGoalMonths = timeToGoalWeeks / 4.33; // More accurate months calculation

    // Goal RMR when target weight is reached
    const goalRMR = goalWeight * 11;

    // Difficulty assessment
    let difficulty = "Moderate";
    if (dailyDeficit >= 500 || workoutFreq >= 5) difficulty = "High";
    if (dailyDeficit <= 300 && workoutFreq <= 3) difficulty = "Low";

    // Sustainability score (1-10)
    let sustainabilityScore = 8;
    if (dailyDeficit > 500) sustainabilityScore -= 2;
    if (workoutFreq > 4) sustainabilityScore -= 1;
    if (workoutFreq === 0) sustainabilityScore -= 1;
    sustainabilityScore = Math.max(1, Math.min(10, sustainabilityScore));

    return {
        name,
        approach,
        dailyDeficit,
        workoutFreq,
        workoutCalories: Math.round(workoutCalories),
        totalDailyDeficit: Math.round(totalDailyDeficit),
        weeklyWeightChange: parseFloat(weeklyWeightChange.toFixed(2)),
        timeToGoalWeeks: Math.ceil(timeToGoalWeeks),
        timeToGoalMonths: parseFloat(timeToGoalMonths.toFixed(1)),
        goalRMR: Math.round(goalRMR),
        difficulty,
        sustainabilityScore,
        meetsTarget: timeToGoalMonths <= targetMonths,
        recommended: false // Will be set based on analysis
    };
}

// Estimate calories burned per workout
function estimateWorkoutCalories(weight, gender) {
    // Basic estimation: varies by weight and gender
    // These are moderate intensity estimates
    const baseCalories = gender === 'male' ? 400 : 350;
    const weightFactor = weight / 150; // Normalize to 150lbs
    return Math.round(baseCalories * weightFactor);
}

// Display scenarios in results
function displayScenariosInResults() {
    if (!scenarioResults) return;

    // Mark recommended scenarios
    markRecommendedScenarios(scenarioResults.scenarios);

    const scenariosHtml = generateScenariosHtml(scenarioResults);
    
    // Add scenarios section to results
    const container = document.getElementById('results-container');
    const currentContent = container.innerHTML;
    
    container.innerHTML = currentContent + `
        <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #e2e8f0;">
            <h2 style="font-size: 1.5rem; font-weight: 600; color: #0f172a; margin-bottom: 24px;">
                📊 Goal Achievement Scenarios
            </h2>
            ${scenariosHtml}
        </div>
    `;
}

// Mark recommended scenarios based on sustainability and timeline
function markRecommendedScenarios(scenarios) {
    // Find scenarios that meet target timeline
    const meetingTarget = scenarios.filter(s => s.meetsTarget);
    
    if (meetingTarget.length > 0) {
        // Recommend the most sustainable option that meets timeline
        const bestSustainable = meetingTarget.reduce((best, current) => 
            current.sustainabilityScore > best.sustainabilityScore ? current : best
        );
        bestSustainable.recommended = true;
        bestSustainable.recommendationReason = "Best balance of results and sustainability";
    } else {
        // If no scenario meets target, recommend fastest sustainable option
        const fastestSustainable = scenarios.filter(s => s.sustainabilityScore >= 6)
            .sort((a, b) => a.timeToGoalWeeks - b.timeToGoalWeeks)[0];
        
        if (fastestSustainable) {
            fastestSustainable.recommended = true;
            fastestSustainable.recommendationReason = "Fastest sustainable approach";
        }
    }
}

// Generate HTML for scenarios display
function generateScenariosHtml(scenarioData) {
    let html = `
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
            <h3 style="margin-bottom: 12px; color: #0f172a;">Goal Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
                <div>
                    <div style="font-size: 13px; color: #6b7280;">Current Weight</div>
                    <div style="font-weight: 600;">${scenarioData.currentWeight} lbs</div>
                </div>
                <div>
                    <div style="font-size: 13px; color: #6b7280;">Target Weight</div>
                    <div style="font-weight: 600;">${scenarioData.goalWeight} lbs</div>
                </div>
                <div>
                    <div style="font-size: 13px; color: #6b7280;">Weight to Lose</div>
                    <div style="font-weight: 600;">${Math.abs(scenarioData.currentWeight - scenarioData.goalWeight).toFixed(1)} lbs</div>
                </div>
                <div>
                    <div style="font-size: 13px; color: #6b7280;">Target Timeline</div>
                    <div style="font-weight: 600;">${scenarioData.targetMonths} months</div>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
    `;

    scenarioData.scenarios.forEach(scenario => {
        const borderColor = scenario.recommended ? '#10b981' : '#e2e8f0';
        const bgColor = scenario.recommended ? '#f0fdf4' : 'white';
        
        html += `
            <div style="background: ${bgColor}; border: 2px solid ${borderColor}; border-radius: 12px; padding: 20px; position: relative;">
                ${scenario.recommended ? '<div style="position: absolute; top: 12px; right: 12px; background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">RECOMMENDED</div>' : ''}
                
                <h4 style="margin-bottom: 12px; color: #0f172a; font-size: 1.1rem;">${scenario.name}</h4>
                
                <div style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 14px; color: #6b7280;">Timeline:</span>
                        <span style="font-weight: 600; color: ${scenario.meetsTarget ? '#10b981' : '#ef4444'};">
                            ${scenario.timeToGoalMonths} months
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 14px; color: #6b7280;">Weekly Loss:</span>
                        <span style="font-weight: 600;">${scenario.weeklyWeightChange} lbs/week</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 14px; color: #6b7280;">Difficulty:</span>
                        <span style="font-weight: 600; color: ${scenario.difficulty === 'Low' ? '#10b981' : scenario.difficulty === 'High' ? '#ef4444' : '#f59e0b'};">
                            ${scenario.difficulty}
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-size: 14px; color: #6b7280;">Sustainability:</span>
                        <span style="font-weight: 600;">${scenario.sustainabilityScore}/10</span>
                    </div>
                </div>

                <div style="background: white; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                    <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">Daily Requirements:</div>
                    <div style="font-size: 14px;">
                        <strong>Diet:</strong> ${scenario.dailyDeficit} cal deficit<br>
                        ${scenario.workoutFreq > 0 ? `<strong>Exercise:</strong> ${scenario.workoutFreq}x/week (${scenario.workoutCalories} cal/day avg)` : '<strong>Exercise:</strong> None'}
                    </div>
                </div>

                ${scenario.recommended ? `
                    <div style="background: #ecfdf5; padding: 8px; border-radius: 4px; border-left: 3px solid #10b981;">
                        <div style="font-size: 12px; color: #065f46; font-weight: 500;">
                            ${scenario.recommendationReason}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    });

    html += '</div>';
    return html;
}

// Tab switching functionality
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + '-tab').classList.add('active');
}

// Navigation function for next step
function nextStep() {
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    
    if (!age || !gender) {
        alert('Please complete all required fields.');
        return;
    }
    switchTab('metrics');
}

// Main calculation function
function calculateResults() {
    // Validate required fields
    const heightFeet = document.getElementById('heightFeet').value;
    const heightInches = document.getElementById('heightInches').value;
    const weight = document.getElementById('weight').value;
    const activityLevel = document.getElementById('activityLevel').value;
    
    if (!heightFeet || !heightInches || !weight || !activityLevel) {
        alert('Please complete all required fields.');
        return;
    }

    // Calculate metrics
    const totalHeightInches = (parseInt(heightFeet) * 12) + parseInt(heightInches);
    const weightNum = parseFloat(weight);
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const activityNum = parseFloat(activityLevel);
    const bodyFat = parseFloat(document.getElementById('bodyFat').value) || null;
    const restingHR = parseFloat(document.getElementById('restingHR').value) || null;
    const fullName = document.getElementById('fullName').value || 'User';

    // BMI calculation - (Body Weight x 703)/Height^2
    const bmi = (weightNum * 703) / (totalHeightInches * totalHeightInches);

    // RMR calculation - Body Weight x 11
    const rmr = weightNum * 11;

    // Total daily calories - RMR * Activity Level
    const totalCalories = rmr * activityNum;

    // Skeletal muscle mass calculation (more accurate formula from document)
    let smm;
    let currentSMM; // Actual muscle mass in lbs
    if (bodyFat) {
        // If body fat is known, calculate lean body mass
        const leanBodyMass = weightNum * (100 - bodyFat) / 100;
        currentSMM = leanBodyMass * 0.85; // SMM is about 85% of lean body mass
        smm = (currentSMM / weightNum) * 100; // SMM/Body Weight
    } else {
        // Estimate based on gender and age
        smm = gender === 'male' ? Math.max(30, 50 - (age - 20) * 0.1) : Math.max(25, 45 - (age - 20) * 0.1);
        currentSMM = (smm / 100) * weightNum;
    }

    // Protein needs - Base Need = SMM * 1.5
    const proteinNeeds = currentSMM * 1.5;

    // Heart Rate calculations
    let maxHR = 220 - age;
    let hrReserve = null;
    let trainingZones = null;
    
    if (restingHR) {
        // Heart Rate Reserve = (220 - Age) - Resting HR
        hrReserve = maxHR - restingHR;
        
        // Training zones based on HRR percentages
        trainingZones = {
            zone1: { 
                min: Math.round(hrReserve * 0.5 + restingHR), 
                max: Math.round(hrReserve * 0.6 + restingHR) 
            },
            zone2: { 
                min: Math.round(hrReserve * 0.6 + restingHR), 
                max: Math.round(hrReserve * 0.7 + restingHR) 
            },
            zone3: { 
                min: Math.round(hrReserve * 0.7 + restingHR), 
                max: Math.round(hrReserve * 0.8 + restingHR) 
            },
            zone4: { 
                min: Math.round(hrReserve * 0.8 + restingHR), 
                max: Math.round(hrReserve * 0.9 + restingHR) 
            },
            zone5: { 
                min: Math.round(hrReserve * 0.9 + restingHR), 
                max: maxHR 
            }
        };
    }

    // Calculate ideal weight ranges for different BMI targets
    const heightSquared = totalHeightInches * totalHeightInches;
    
    // Healthy range: BMI 23-25 (from document)
    const idealWeightHealthy = {
        min: Math.round((heightSquared * 23) / 703),
        max: Math.round((heightSquared * 25) / 703)
    };
    
    // Athletic range: BMI 25-29 (from document)
    const idealWeightAthletic = {
        min: Math.round((heightSquared * 25) / 703),
        max: Math.round((heightSquared * 29) / 703)
    };

    // Store all calculated results
    currentResults = {
        fullName, totalHeightInches, weight: weightNum, age, gender, bmi, rmr, totalCalories, 
        smm, currentSMM, proteinNeeds, bodyFat, restingHR, maxHR, hrReserve, trainingZones,
        idealWeightHealthy, idealWeightAthletic
    };

    displayResults();
    switchTab('results');
}

// Display results function
function displayResults() {
    const data = currentResults;
    const container = document.getElementById('results-container');

    // Determine BMI category
    let bmiCategory = '';
    if (data.bmi < 18.5) bmiCategory = 'Underweight';
    else if (data.bmi < 25) bmiCategory = 'Normal Weight';
    else if (data.bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';

    // Determine SMM status
    const idealSMMMin = data.gender === 'male' ? 45 : 40;
    const idealSMMMax = data.gender === 'male' ? 55 : 50;
    let smmStatus = '';
    if (data.smm < idealSMMMin) smmStatus = 'Below ideal range';
    else if (data.smm <= idealSMMMax) smmStatus = 'Within healthy range';
    else smmStatus = 'Above average';

    // Format height display
    const feet = Math.floor(data.totalHeightInches / 12);
    const inches = data.totalHeightInches % 12;
    const heightDisplay = `${feet}'${inches}"`;

    // Generate results HTML
    container.innerHTML = `
        <div class="user-info-display">
            <div class="user-name">${data.fullName}</div>
            <div class="report-date">Health Assessment Report - ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric' 
            })}</div>
        </div>

        <div class="results-grid">
            <div class="metric-card">
                <div class="metric-value">${data.bmi.toFixed(1)}</div>
                <div class="metric-title">Body Mass Index</div>
                <div class="metric-description">
                    <strong>${bmiCategory}</strong><br>
                    Measures body fat based on height and weight ratio
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-value">${data.rmr.toFixed(0)}</div>
                <div class="metric-title">Resting Metabolic Rate</div>
                <div class="metric-description">
                    <strong>Calories/day at rest</strong><br>
                    Energy needed for basic body functions
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-value">${data.totalCalories.toFixed(0)}</div>
                <div class="metric-title">Total Daily Calories</div>
                <div class="metric-description">
                    <strong>Including activity level</strong><br>
                    Total energy expenditure per day
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-value">${data.smm.toFixed(1)}%</div>
                <div class="metric-title">Skeletal Muscle Mass</div>
                <div class="metric-description">
                    <strong>${smmStatus}</strong><br>
                    Percentage of body weight as muscle
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-value">${data.proteinNeeds.toFixed(0)}g</div>
                <div class="metric-title">Daily Protein Target</div>
                <div class="metric-description">
                    <strong>Recommended intake</strong><br>
                    Based on muscle mass maintenance needs
                </div>
            </div>

            ${data.trainingZones ? `
            <div class="metric-card">
                <div class="metric-value">${data.maxHR}</div>
                <div class="metric-title">Max Heart Rate</div>
                <div class="metric-description">
                    <strong>Zone 3: ${data.trainingZones.zone3.min}-${data.trainingZones.zone3.max} bpm</strong><br>
                    Aerobic training zone
                </div>
            </div>
            ` : ''}
        </div>

        <div class="health-ranges">
            <div class="range-item">
                <div class="range-title">Your Stats</div>
                <div class="range-value">${heightDisplay}, ${data.weight} lbs, Age ${data.age}</div>
            </div>
            <div class="range-item">
                <div class="range-title">Healthy Weight Range</div>
                <div class="range-value">${data.idealWeightHealthy.min} - ${data.idealWeightHealthy.max} lbs</div>
            </div>
            <div class="range-item">
                <div class="range-title">Athletic Weight Range</div>
                <div class="range-value">${data.idealWeightAthletic.min} - ${data.idealWeightAthletic.max} lbs</div>
            </div>
            <div class="range-item">
                <div class="range-title">Healthy Body Fat</div>
                <div class="range-value">${data.gender === 'male' ? '12-20%' : '22-30%'}</div>
            </div>
            <div class="range-item">
                <div class="range-title">Muscle Mass Range</div>
                <div class="range-value">${idealSMMMin}-${idealSMMMax}%</div>
            </div>
            <div class="range-item">
                <div class="range-title">Current Muscle Mass</div>
                <div class="range-value">${data.currentSMM.toFixed(1)} lbs</div>
            </div>
        </div>

        ${data.trainingZones ? `
        <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #bae6fd;">
            <h3 style="margin-bottom: 16px; color: #0f172a;">Heart Rate Training Zones</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
                <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                    <div style="font-weight: 600; color: #059669;">Zone 1 (50-60%)</div>
                    <div style="font-size: 14px;">${data.trainingZones.zone1.min}-${data.trainingZones.zone1.max} bpm</div>
                    <div style="font-size: 12px; color: #6b7280;">Recovery</div>
                </div>
                <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                    <div style="font-weight: 600; color: #0ea5e9;">Zone 2 (60-70%)</div>
                    <div style="font-size: 14px;">${data.trainingZones.zone2.min}-${data.trainingZones.zone2.max} bpm</div>
                    <div style="font-size: 12px; color: #6b7280;">Base Endurance</div>
                </div>
                <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                    <div style="font-weight: 600; color: #f59e0b;">Zone 3 (70-80%)</div>
                    <div style="font-size: 14px;">${data.trainingZones.zone3.min}-${data.trainingZones.zone3.max} bpm</div>
                    <div style="font-size: 12px; color: #6b7280;">Aerobic</div>
                </div>
                <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                    <div style="font-weight: 600; color: #ef4444;">Zone 4 (80-90%)</div>
                    <div style="font-size: 14px;">${data.trainingZones.zone4.min}-${data.trainingZones.zone4.max} bpm</div>
                    <div style="font-size: 12px; color: #6b7280;">Threshold</div>
                </div>
                <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                    <div style="font-weight: 600; color: #7c3aed;">Zone 5 (90-100%)</div>
                    <div style="font-size: 14px;">${data.trainingZones.zone5.min}-${data.trainingZones.zone5.max} bpm</div>
                    <div style="font-size: 12px; color: #6b7280;">Power</div>
                </div>
            </div>
        </div>
        ` : ''}

        ${data.bodyFat ? `
            <div class="alert alert-info">
                <strong>Body Fat Analysis:</strong> Your current body fat is ${data.bodyFat}%. 
                ${data.bodyFat > (data.gender === 'male' ? 20 : 30) ? 'Focus on creating a caloric deficit through balanced nutrition and resistance training.' : 
                  data.bodyFat < (data.gender === 'male' ? 12 : 22) ? 'You are in a lean range. Focus on maintaining current levels.' : 
                  'You are within a healthy range. Continue with balanced nutrition and regular exercise.'}
            </div>
        ` : ''}

        <div class="alert alert-warning">
            <strong>Medical Disclaimer:</strong> These calculations are estimates based on standard formulas and should not replace professional medical advice. Consult with healthcare providers for personalized health recommendations.
        </div>
    `;
}

// Goal calculation function - comprehensive analysis
function calculateGoals() {
    const currentWeight = parseFloat(document.getElementById('weight').value);
    const goalWeight = parseFloat(document.getElementById('goalWeight').value);
    const goalBodyFat = parseFloat(document.getElementById('goalBodyFat').value) || null;
    const gender = document.getElementById('gender').value;

    if (!currentWeight) {
        alert('Please enter your current weight first.');
        return;
    }

    let analysis = '🎯 Goal Analysis:\n\n';

    // Weight goal analysis
    if (goalWeight) {
        const weightDifference = Math.abs(currentWeight - goalWeight);
        const currentRMR = currentWeight * 11;
        const goalRMR = goalWeight * 11;
        const caloricDeficit = Math.abs(currentRMR - goalRMR);
        const weeklyDeficit = caloricDeficit * 7;
        const weeklyWeightChange = weeklyDeficit / 3500; // 3500 calories per pound
        const timeToGoal = weightDifference / weeklyWeightChange;
        const goalType = currentWeight > goalWeight ? 'lose' : 'gain';

        analysis += `📊 Weight Goal: ${goalType} ${weightDifference.toFixed(1)} lbs\n`;
        analysis += `⚖️ Weekly ${goalType === 'lose' ? 'loss' : 'gain'}: ${weeklyWeightChange.toFixed(2)} lbs\n`;
        analysis += `⏱️ Timeline: ${Math.ceil(timeToGoal)} weeks (${Math.ceil(timeToGoal/4)} months)\n`;
        analysis += `🔥 Daily caloric ${goalType === 'lose' ? 'deficit' : 'surplus'}: ${caloricDeficit.toFixed(0)} calories\n\n`;
    }

    // Body fat goal analysis
    if (goalBodyFat && currentResults && currentResults.bodyFat) {
        const currentBodyFat = currentResults.bodyFat;
        const fatDifference = currentBodyFat - goalBodyFat;
        
        if (fatDifference > 0) {
            // Fat loss calculation from document
            const currentFatWeight = currentWeight * (currentBodyFat / 100);
            const goalFatWeight = currentWeight * (goalBodyFat / 100);
            const fatToLose = currentFatWeight - goalFatWeight;
            
            analysis += `🔥 Body Fat Goal:\n`;
            analysis += `Current: ${currentBodyFat}% (${currentFatWeight.toFixed(1)} lbs fat)\n`;
            analysis += `Target: ${goalBodyFat}% (${goalFatWeight.toFixed(1)} lbs fat)\n`;
            analysis += `Fat to lose: ${fatToLose.toFixed(1)} lbs\n\n`;
        }
    }

    // Muscle mass analysis from document
    if (currentResults) {
        const currentSMM = currentResults.currentSMM;
        const idealSMMMin = gender === 'male' ? 45 : 40;
        const idealSMMMax = gender === 'male' ? 55 : 50;
        const currentSMMPercent = currentResults.smm;
        const targetWeight = goalWeight || currentWeight;
        
        // Calculate ideal muscle mass for target weight
        const idealMuscleMassMin = (targetWeight * idealSMMMin / 100);
        const idealMuscleMassMax = (targetWeight * idealSMMMax / 100);
        const muscleToGainMin = Math.max(0, idealMuscleMassMin - currentSMM);
        const muscleToGainMax = Math.max(0, idealMuscleMassMax - currentSMM);
        
        analysis += `💪 Muscle Mass Analysis:\n`;
        analysis += `Current: ${currentSMM.toFixed(1)} lbs (${currentSMMPercent.toFixed(1)}%)\n`;
        analysis += `Ideal range: ${idealMuscleMassMin.toFixed(1)} - ${idealMuscleMassMax.toFixed(1)} lbs\n`;
        
        if (muscleToGainMin > 0) {
            analysis += `Muscle to gain: ${muscleToGainMin.toFixed(1)} - ${muscleToGainMax.toFixed(1)} lbs\n`;
            analysis += `Additional protein needed: ${(muscleToGainMax * 1.5).toFixed(0)}g daily\n`;
        } else {
            analysis += `✅ You're within the ideal muscle mass range!\n`;
        }
    }

    alert(analysis);
}

// Ideal weight calculation function - based on document formulas
function calculateIdealWeight() {
    const heightFeet = parseInt(document.getElementById('heightFeet').value);
    const heightInches = parseInt(document.getElementById('heightInches').value);
    const goalBMI = parseFloat(document.getElementById('goalBMI').value);

    if (!heightFeet || !heightInches) {
        alert('Please enter your height first.');
        return;
    }

    const totalHeightInches = (heightFeet * 12) + heightInches;
    const heightSquared = totalHeightInches * totalHeightInches;

    let analysis = '📏 Ideal Weight Calculator:\n\n';
    
    // Height display
    const feet = Math.floor(totalHeightInches / 12);
    const inches = totalHeightInches % 12;
    analysis += `Height: ${feet}'${inches}"\n\n`;

    // Standard BMI ranges using formula: (Height^2 * Desired BMI)/703
    const underweight = Math.round((heightSquared * 18.4) / 703);
    const normalMin = Math.round((heightSquared * 18.5) / 703);
    const normalMax = Math.round((heightSquared * 24.9) / 703);
    const overweightMax = Math.round((heightSquared * 29.9) / 703);
    const obeseStart = Math.round((heightSquared * 30) / 703);

    analysis += `📊 BMI Weight Ranges:\n`;
    analysis += `Underweight: < ${underweight} lbs (BMI < 18.5)\n`;
    analysis += `Normal: ${normalMin} - ${normalMax} lbs (BMI 18.5-24.9)\n`;
    analysis += `Overweight: ${normalMax + 1} - ${overweightMax} lbs (BMI 25-29.9)\n`;
    analysis += `Obese: ${obeseStart}+ lbs (BMI 30+)\n\n`;

    // Recommended ranges from document
    const healthyMin = Math.round((heightSquared * 23) / 703);
    const healthyMax = Math.round((heightSquared * 25) / 703);
    const athleticMin = Math.round((heightSquared * 25) / 703);
    const athleticMax = Math.round((heightSquared * 29) / 703);

    analysis += `🎯 Recommended Ranges (from document):\n`;
    analysis += `General Health: ${healthyMin} - ${healthyMax} lbs (BMI 23-25)\n`;
    analysis += `Athletic/Muscular: ${athleticMin} - ${athleticMax} lbs (BMI 25-29)\n\n`;

    // Custom BMI calculation
    if (goalBMI) {
        const customWeight = Math.round((heightSquared * goalBMI) / 703);
        analysis += `🎯 Your Custom Goal:\n`;
        analysis += `BMI ${goalBMI}: ${customWeight} lbs\n`;
    }

    alert(analysis);
}

// Download report function
function downloadReport() {
    if (!currentResults) {
        alert('Please calculate your metrics first to download the report.');
        return;
    }
    
    const reportContent = document.getElementById('results-container').innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Health Metrics Report - ${currentResults.fullName}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 40px; 
                    line-height: 1.6; 
                    color: #1e293b;
                }
                .user-info-display { 
                    background: #f8fafc; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin-bottom: 30px; 
                    border: 1px solid #e2e8f0;
                }
                .user-name {
                    font-weight: 600;
                    font-size: 1.2rem;
                    margin-bottom: 5px;
                }
                .results-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                    gap: 20px; 
                    margin: 30px 0; 
                }
                .metric-card { 
                    border: 1px solid #e2e8f0; 
                    padding: 20px; 
                    border-radius: 8px; 
                    text-align: center; 
                }
                .metric-value { 
                    font-size: 2rem; 
                    font-weight: bold; 
                    margin-bottom: 8px; 
                    color: #0f172a;
                }
                .metric-title {
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                .health-ranges { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
                    gap: 15px; 
                    margin: 25px 0; 
                }
                .range-item { 
                    background: #f8fafc; 
                    padding: 15px; 
                    border-radius: 6px; 
                    text-align: center; 
                    border: 1px solid #e2e8f0;
                }
                .range-title {
                    font-weight: 600;
                    margin-bottom: 5px;
                }
                .alert { 
                    padding: 15px; 
                    border-radius: 6px; 
                    margin: 15px 0; 
                    background: #fffbeb; 
                    border: 1px solid #fde68a;
                }
                h1 {
                    color: #0f172a;
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 10px;
                }
            </style>
        </head>
        <body>
            <h1>Health Metrics Assessment Report</h1>
            ${reportContent}
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #6b7280; text-align: center;">
                Generated on ${new Date().toLocaleString()} | Health Metrics Calculator
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 250);
}

// Print report function
function printReport() {
    window.print();
}

// Share report function
function shareReport() {
    if (!currentResults) {
        alert('Please calculate your metrics first to share the report.');
        return;
    }

    const shareText = `🏥 My Health Metrics Report:
📊 BMI: ${currentResults.bmi.toFixed(1)} (${currentResults.bmi < 18.5 ? 'Underweight' : currentResults.bmi < 25 ? 'Normal' : currentResults.bmi < 30 ? 'Overweight' : 'Obese'})
🔥 Daily Calories: ${currentResults.totalCalories.toFixed(0)}
💪 Muscle Mass: ${currentResults.smm.toFixed(1)}% (${currentResults.currentSMM.toFixed(1)} lbs)
🥩 Protein Target: ${currentResults.proteinNeeds.toFixed(0)}g
⚖️ Healthy Weight Range: ${currentResults.idealWeightHealthy.min}-${currentResults.idealWeightHealthy.max} lbs
${currentResults.trainingZones ? `❤️ Target Heart Rate Zone: ${currentResults.trainingZones.zone3.min}-${currentResults.trainingZones.zone3.max} bpm` : ''}

Generated with Health Metrics Calculator`;

    if (navigator.share) {
        navigator.share({
            title: 'My Health Metrics Report',
            text: shareText,
        }).catch(() => {
            // Fallback to clipboard
            copyToClipboard(shareText);
        });
    } else {
        copyToClipboard(shareText);
    }
}

// Helper function to copy text to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Report summary copied to clipboard!');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// Fallback copy function for older browsers
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        alert('Report summary copied to clipboard!');
    } catch (err) {
        alert('Could not copy to clipboard. Please copy the text manually from the alert.');
        alert(text);
    }
    
    document.body.removeChild(textArea);
} 