# Setting Up Performance Tracking with Lighthouse CI

This guide shows how to set up Lighthouse CI to track performance changes in your Next.js application and fail CI when performance degrades significantly.

## Comparison: Option 1 vs. Option 2

### Option 1: Delta-based Approach (Compare with Previous Scores)
- **Pros**: 
  - Automatically compares against baseline scores
  - Prevents gradual performance degradation over time
  - More flexible for established projects

- **Cons**:
  - Requires baseline data to be effective
  - Slightly more complex setup
  - Needs initial runs to establish baselines

### Option 2: Threshold-based Approach (Fixed Score Requirements)
- **Pros**:
  - Simpler to set up and understand
  - Works immediately without baseline
  - Clear, consistent requirements

- **Cons**:
  - Doesn't account for project-specific performance challenges
  - Might be too strict or too lenient depending on the project
  - Doesn't detect gradual small degradations

## Recommendation

For teams new to performance tracking, **Option 2 (Threshold-based)** is recommended for its simplicity and immediate feedback. Once teams get comfortable with performance monitoring, they can transition to Option 1 for more nuanced tracking.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install --save-dev @lhci/cli cross-env
```

### 2. Create Configuration File

Create `.lighthouserc.js` in your project root with either the Option 1 (`.lighthouserc.js`) or Option 2 (`.lighthouserc.v2.js`) configuration, remember to change the name of the file to `.lighthouserc.js` irrespective of the configuration you decide to use.

### 3. Update GitHub Actions Workflow

Update your CI workflow file using the provided template for the option chosen in the previous step; i.e. (`.github/workflows/ci-cd.yaml`) for Option 1 and (`.github/workflows/ci-cd-fixed.yaml`) for Option 2.
Also remember to update the local server in the workflow, currently it defaults to `http://localhost:3000`

### 4. Add Scripts to package.json

Ensure these scripts are in your package.json:

```json
"scripts": {
  "build": "next build",
  "start": "next start",
  "lighthouse": "lhci autorun"
}
```

### 5. Set Thresholds (Option 2 only)

For Option 2, define your performance thresholds either:
- Directly in the `.lighthouserc.js` file
- As environment variables in your CI workflow
- In a `.env.lighthouse` file for local testing
See sample template in `.lighthouserc.v2.js`

## Adjusting Thresholds

For Option 2, you can adjust thresholds in your CI workflow file:

```yaml
env:
  PERF_THRESHOLD: 70  # Increase from 60 to 70
  A11Y_THRESHOLD: 90  # Increase from 80 to 90
```
See sample template in `.github/workflows/ci-cd-fixed.yaml`

## Running Locally

To test your Lighthouse CI setup locally:

```bash
# Build your Next.js app
npm run build

# Start the server
npm run start

# In another terminal:
npm run lighthouse
```

## Viewing Reports

Reports are saved to the `.lighthouseci` directory and uploaded as artifacts in GitHub Actions. You can view them directly or use a Lighthouse CI server for better visualization.

## Next Steps

After setting up basic performance tracking, consider:

1. Setting up a Lighthouse CI server for persistent storage and visualization (right now it uses google temporal storage)
2. Adding performance budgets for specific assets
3. Creating custom GitHub Actions to comment on PRs with performance results


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci/) - learn more about Lighthouse CI
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
