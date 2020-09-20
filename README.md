This is a frontend app that helps to visualize compensation data in a specific format that's hard to generate with Google Sheets and Exel charts, but makes numbers easier to compare. It is a frontend static app –– purposely unstateful with the data it sees so as to not leak sensitive personal information. Files can be dropped into the app to be visualized, but will never be saved and will be wiped from view on page load.

### To run

```
npm install
npm start
```

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### To deploy

The application automatically deploys itself from the `main` branch via Netlify to https://determined-allen-3e2961.netlify.app/.

```
npm build
```

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.
