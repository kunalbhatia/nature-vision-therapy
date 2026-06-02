// cypress/e2e/home.cy.ts
describe("Home Page", () => {
  it("loads and shows the title", () => {
    cy.visit("/");
    cy.contains("Welcome to Nature Vision Therapy").should("exist");
  });
});
