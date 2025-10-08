import SignupForm from "../../components/SignupForm";
import { mount } from "@cypress/react";
import { PreloaderProvider } from "../../context/PreloaderContext";

describe("SignupForm Component", () => {
  let onSignup: Cypress.Agent<sinon.SinonStub>;
  let onStatusUpdate: Cypress.Agent<sinon.SinonStub>;

  beforeEach(() => {
    onSignup = cy.stub().as("onSignup");
    onStatusUpdate = cy.stub().as("onStatusUpdate");

    mount(
      <PreloaderProvider>
        <SignupForm onSignup={onSignup} onStatusUpdate={onStatusUpdate} />
      </PreloaderProvider>,
    );
  });

  // Task 3: Validation check
  it("shows validation errors for empty fields", () => {
    cy.get('[data-testid="signup-button"]').click();
    cy.get('[data-testid="email-input"]')
      .parent()
      .find("p")
      .should("have.text", "Invalid email address");
    cy.get('[data-testid="password-input"]')
      .parent()
      .find("p")
      .should("have.text", "Password must be at least 6 characters");
    cy.get('[data-testid="confirm-password-input"]')
      .parent()
      .find("p")
      .should("have.text", "Passwords must match");
  });

  // Task 4: Successful submission
  it("calls onSignup and onStatusUpdate on valid submit", () => {
    cy.intercept("POST", "/api/signup", {
      statusCode: 201,
      body: { message: "Signup successful", status: "success" },
    }).as("signupRequest");

    cy.get('[data-testid="email-input"]').type("newuser@example.com");
    cy.get('[data-testid="password-input"]').type("SecurePass123");
    cy.get('[data-testid="confirm-password-input"]').type("SecurePass123");
    cy.get('[data-testid="signup-button"]').click();

    cy.wait("@signupRequest");
    cy.get("@onSignup").should("have.been.calledOnce");
    cy.get("@onStatusUpdate").should(
      "have.been.calledWith",
      "Signup successful",
      "success",
    );
  });
});
