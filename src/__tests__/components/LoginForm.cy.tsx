import LoginForm from "../../components/LoginForm";
import { mount } from "@cypress/react";
import { PreloaderProvider } from "../../context/PreloaderContext";

describe("LoginForm Component", () => {
  let onLogin: Cypress.Agent<sinon.SinonStub>;
  let onStatusUpdate: Cypress.Agent<sinon.SinonStub>;

  beforeEach(() => {
    onLogin = cy.stub().as("onLogin");
    onStatusUpdate = cy.stub().as("onStatusUpdate");

    mount(
      <PreloaderProvider>
        <LoginForm onLogin={onLogin} onStatusUpdate={onStatusUpdate} />
      </PreloaderProvider>,
    );
  });

  it("renders email, password inputs and login button", () => {
    cy.get('[data-testid="email-input"]').should("exist");
    cy.get('[data-testid="password-input"]').should("exist");
    cy.get('[data-testid="login-button"]').should("exist");
  });

  it("shows validation errors for empty fields", () => {
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="email-input"]')
      .parent()
      .find("p")
      .should("have.text", "Invalid email address");
    cy.get('[data-testid="password-input"]')
      .parent()
      .find("p")
      .should("have.text", "Too small: expected string to have >=6 characters");
  });

  it("calls onLogin and onStatusUpdate on valid submit", () => {
    cy.intercept("POST", "/api/login", {
      statusCode: 200,
      body: { message: "Login successful", status: "success" },
    }).as("loginRequest");

    cy.get('[data-testid="email-input"]').type("test@example.com");
    cy.get('[data-testid="password-input"]').type("password123");
    cy.get('[data-testid="login-button"]').click();

    cy.wait("@loginRequest");
    cy.get("@onLogin").should("have.been.calledOnce");
    cy.get("@onStatusUpdate").should(
      "have.been.calledWith",
      "Login successful",
      "success",
    );
  });
});
