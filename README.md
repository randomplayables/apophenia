# Apophenia

## Overview

Apophenia tests your ability to distinguish between random noise and actual data patterns. The game is inspired by statistical methods for graphical inference, including the "lineup" and "Rorschach" protocols described in Wickham et al. (2010) and Buja et al. (2009).

## Features

- **Two Complementary Protocols**:
  - **Rorschach Protocol**: A training phase where you view primarily random data plots to calibrate your perception and avoid seeing false patterns in noise.
  - **Lineup Protocol**: The main game where you must identify which plot contains a true data pattern among multiple plots showing random data.

- **Customizable Difficulty**:
  - Adjust the initial noise level to make the game easier or harder.
  - Watch as the difficulty automatically increases with each correct answer.

- **Advanced Configuration Options**:
  - Customize the number of plots and data points per plot.
  - For advanced users: Write your own data generation functions and difficulty progression algorithms using JavaScript.

## Game Rules

### Getting Started

1. **Game Setup**:
   - Choose the number of plots to display (default: 9)
   - Set the number of data points per plot (default: 100)
   - Select the initial difficulty (noise level)
   - Optionally configure advanced pattern generation settings

2. **Protocol Selection**:
   - Start with the Rorschach protocol to train your perception (recommended for first-time players)
   - Or go directly to the Lineup protocol to test your pattern recognition skills

### Rorschach Protocol (Training)

1. **Purpose**: Calibrate your perception to recognize what random patterns look like, helping you avoid apophenia (seeing false patterns in noise).

2. **Gameplay**:
   - Observe multiple plots of primarily random data.
   - Look for features that stand out: clusters, outliers, or trends that appear by chance.
   - Use the "Generate New Plots" button to view more examples.
   - Continue to the Lineup protocol when you feel ready.

### Lineup Protocol (Main Game)

1. **Goal**: Identify which plot contains the true data pattern among the random plots.

2. **Gameplay**:
   - One plot contains real data with a pattern (signal).
   - The other plots show random data (noise) with no underlying pattern.
   - Click on a plot to select it, then click again to confirm your selection.

3. **Scoring**:
   - Each correct identification advances you to the next level.
   - With each level, the noise increases, making the true pattern harder to detect.
   - Your final score is the number of levels you complete before making a mistake.

4. **Game Over**:
   - The game ends when you incorrectly identify a plot.
   - Your final score and noise level are displayed.

## Implementation Details

The game is built using:
- React
- TypeScript
- Vite
- Tailwind CSS
- Plotly.js for data visualization
- jStat for statistical functions

## Scientific Background

Apophenia is the human tendency to perceive meaningful connections or patterns in random data. This psychological phenomenon is particularly relevant in data analysis and statistics, where distinguishing between actual patterns and random noise is crucial.

The game implements two protocols from visual inference research:

1. **The Lineup Protocol**: A formal statistical method where observers must identify which plot (among several) contains the "real" data rather than null (random) data. This approach provides a valid test of graphical findings.

2. **The Rorschach Protocol**: Named after the famous inkblot test, this protocol shows observers only null plots to help them calibrate their perception against random patterns.

These protocols were introduced in:
- Wickham, H., Cook, D., Hofmann, H., & Buja, A. (2010). Graphical inference for infovis. IEEE Transactions on Visualization and Computer Graphics, 16(6), 973-979.
- Buja A., Cook D., Hofmann H., Lawrence M., Lee E., Swayne D.F., Wickham H. (2009). Statistical Inference for Exploratory Data Analysis and Model Diagnostics. Royal Society Philosophical Transactions A, 367(1906), 4361-4383.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

randomplayables@proton.me