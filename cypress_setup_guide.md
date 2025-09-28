# Cypress Component Testing Setup Guide 🧪

## 1. Configure 🔧 cypress.config.ts

We added the component block to enable component testing:

```typescript
component: {
  devServer: {
    framework: 'react',
    bundler: 'vite',
    viteConfig,
  },
  supportFile: 'cypress/support/component.ts',
  specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
}
```

**Why:**

- `framework: 'react'` tells Cypress to use React-specific mounting
- `bundler: 'vite'` ensures fast dev builds
- `viteConfig` allows reuse of your existing Vite setup
- `supportFile` loads global setup before each test
- `specPattern` scopes tests to your component files

## 2. Create Support File 📁

**Path:** `cypress/support/component.ts`

```typescript
// cypress/support/component.ts
// Optional: import custom commands or global styles
```

**Why:**
Cypress uses this file to inject setup logic before each test. Even an empty file avoids config errors.

## 3. Create 🧱 component-index.html

**Path:** `cypress/support/component-index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Cypress Component Test</title>
</head>
<body>
  <div data-cy-root></div>
</body>
</html>
```

**Why:**
Cypress mounts components into the `data-cy-root` container. Without this, tests will fail with a DOM error.

## 4. Write Component Specs 🧪

**Example:** `src/components/Controls.cy.tsx`

```typescript
import Controls from './Controls';
import { mount } from '@cypress/react';

describe('Controls Component', () => {
  let onTopicSelect: Cypress.Agent<sinon.SinonStub>;
  let setFontSize: Cypress.Agent<sinon.SinonStub>;

  beforeEach(() => {
    onTopicSelect = cy.stub().as('onTopicSelect');
    setFontSize = cy.stub().as('setFontSize');
    mount(<Controls onTopicSelect={onTopicSelect} fontSize={1.6} setFontSize={setFontSize} />);
  });

  it('renders all buttons and dropdown', () => {
    cy.contains('−').should('exist');
    cy.contains('+').should('exist');
    cy.contains(' ').should('exist');
    cy.get('select').should('exist');
  });

  it('calls setFontSize when buttons are clicked', () => {
    cy.contains('+').click();
    expect(setFontSize.getCall(0).args[0]).to.be.closeTo(1.8, 0.001);
    
    cy.contains('−').click();
    expect(setFontSize.getCall(1).args[0]).to.be.closeTo(1.4, 0.001);
  });

  it('calls onTopicSelect when a topic is selected', () => {
    cy.get('select').select('magic');
    expect(onTopicSelect).to.have.been.calledWith('magic');
  });
});
```

**Why:**

- `mount()` renders the component in isolation
- `cy.stub()` tracks function calls
- `closeTo()` handles floating-point precision

---

## Cypress End-to-End (E2E) Testing Setup Guide 🌐

## 1. Extend 🔧 cypress.config.ts

Add the e2e block:

```typescript
e2e: {
  baseUrl: 'http://localhost:5173',
  supportFile: 'cypress/support/e2e.ts',
  specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
}
```

**Why:**

- `baseUrl` simplifies `cy.visit()` calls
- `supportFile` loads global setup for E2E
- `specPattern` scopes tests to your E2E folder

## 2. Create E2E Support File 📁

**Path:** `cypress/support/e2e.ts`

```typescript
// cypress/support/e2e.ts
// Optional: import custom commands or global hooks
```

**Why:**
This file runs before every E2E test. You can add `beforeEach`, `afterEach`, or global intercepts here.

## 3. Write E2E Specs 🧪

**Example:** `cypress/e2e/home.cy.ts`

```typescript
describe('Home Page', () => {
  it('loads and shows the title', () => {
    cy.visit('/');
    cy.contains('Select a story topic').should('exist');
  });
});
```

**Why:**

- `cy.visit('/')` loads your app
- `cy.contains()` verifies UI content
- This test confirms your app boots correctly

## 4. Run Cypress 🚀

To open the test runner:

```bash
npx cypress open --e2e
```

To run headless:

```bash
npx cypress run --e2e
```

---

## Best Practices 🧠

- ✅ Use `.cy.tsx` for component specs and `.cy.ts` for E2E specs
- ✅ Keep stubs inside `beforeEach` to avoid context errors
- ✅ Use `closeTo()` for floating-point assertions
- ✅ Avoid `cy.visit()` in component tests — it's only for E2E
- ✅ Use `data-cy` attributes for stable selectors in E2E tests
