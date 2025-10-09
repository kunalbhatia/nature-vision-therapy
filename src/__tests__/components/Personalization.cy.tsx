import { mount } from "@cypress/react";
import Personalization from "../../components/Personalization";
import { PreloaderProvider } from "../../context/PreloaderContext";
import { SnackbarProvider } from "../../providers/SnackbarProvider";

describe("Personalization Component", () => {
  beforeEach(() => {
    // Stub API calls
    cy.intercept("GET", "/api/get-characters-details", {
      statusCode: 200,
      body: { characterDetails: {} },
    }).as("getCharacters");

    cy.intercept("POST", "/api/save-characters", {
      statusCode: 200,
      body: { status: "success", message: "Details saved successfully" },
    }).as("saveCharacters");
  });

  const mountComponent = (onSave = cy.stub().as("onSave")) => {
    mount(
      <PreloaderProvider>
        <SnackbarProvider>
          <Personalization onSave={onSave} />
        </SnackbarProvider>
      </PreloaderProvider>,
    );
  };

  it("should render the component with title and description", () => {
    mountComponent();

    cy.get('[data-testid="personalization-title"]')
      .should("be.visible")
      .and("contain", "Personalization");

    cy.contains("Enter names and birth years for each character:").should(
      "be.visible",
    );
  });

  it("should render all default character fields", () => {
    mountComponent();

    const defaultCharacters = [
      "me",
      "behan",
      "mummy",
      "papa",
      "mama",
      "dada",
      "dadi",
      "nani",
      "nanu",
      "bhai",
    ];

    defaultCharacters.forEach((key) => {
      cy.get(`[data-testid="name-${key}"]`).should("exist");
      cy.get(`[data-testid="birthYear-${key}"]`).should("exist");
    });
  });

  it("should allow entering name and birth year", () => {
    mountComponent();

    cy.get('[data-testid="name-me"]').type("Jhalak");
    cy.get('[data-testid="birthYear-me"]').type("1995");

    cy.get('[data-testid="name-me"]').should("have.value", "Jhalak");
    cy.get('[data-testid="birthYear-me"]').should("have.value", "1995");
  });

  it("should calculate and display age when birth year is entered", () => {
    mountComponent();

    const currentYear = new Date().getFullYear();
    const birthYear = "1995";
    const expectedAge = currentYear - parseInt(birthYear);

    cy.get('[data-testid="birthYear-me"]').type(birthYear);
    cy.contains(`Age: ${expectedAge} years`).should("be.visible");
  });

  it('should show gender dropdown for "me" field', () => {
    mountComponent();

    cy.get('[data-testid="gender-me"]').should("exist");
    cy.get('[data-testid="gender-me"]').select("male");
    cy.get('[data-testid="gender-me"]').should("have.value", "male");
  });

  it("should not show gender dropdown for non-custom default characters", () => {
    mountComponent();

    cy.get('[data-testid="gender-behan"]').should("not.exist");
    cy.get('[data-testid="gender-mummy"]').should("not.exist");
    cy.get('[data-testid="gender-papa"]').should("not.exist");
  });

  it("should add a custom character", () => {
    mountComponent();

    cy.get('[data-testid="add-character-input"]').type("Best Friend");
    cy.get('[data-testid="add-character-button"]').click();

    cy.get('[data-testid="name-custom_0"]').should("exist");
    cy.get('[data-testid="birthYear-custom_0"]').should("exist");
    cy.get('[data-testid="gender-custom_0"]').should("exist");
  });

  it("should add multiple custom characters", () => {
    mountComponent();

    cy.get('[data-testid="add-character-input"]').type("Best Friend");
    cy.get('[data-testid="add-character-button"]').click();

    cy.get('[data-testid="add-character-input"]').type("Cousin");
    cy.get('[data-testid="add-character-button"]').click();

    cy.get('[data-testid="name-custom_0"]').should("exist");
    cy.get('[data-testid="name-custom_1"]').should("exist");
  });

  it("should not add custom character with empty label", () => {
    mountComponent();

    cy.get('[data-testid="add-character-button"]').click();
    cy.get('[data-testid="name-custom_0"]').should("not.exist");
  });

  it("should clear custom character input after adding", () => {
    mountComponent();

    cy.get('[data-testid="add-character-input"]').type("Best Friend");
    cy.get('[data-testid="add-character-button"]').click();

    cy.get('[data-testid="add-character-input"]').should("have.value", "");
  });

  it("should save details and call onSave callback", () => {
    const onSaveSpy = cy.stub().as("onSave");
    mountComponent(onSaveSpy);

    cy.get('[data-testid="name-me"]').type("Jhalak");
    cy.get('[data-testid="birthYear-me"]').type("1995");
    cy.get('[data-testid="gender-me"]').select("female");

    cy.get('[data-testid="save-details-button"]').click();

    cy.wait("@saveCharacters")
      .its("request.body")
      .should("deep.include", {
        characterDetails: {
          me: {
            name: "Jhalak",
            birthYear: 1995,
            gender: "female",
            relationshipWithMe: "self",
          },
        },
      });

    cy.get("@onSave").should("have.been.calledOnce");
  });

  it("should load existing character details from API", () => {
    cy.intercept("GET", "/api/get-characters-details", {
      statusCode: 200,
      body: {
        characterDetails: {
          me: {
            name: "Jhalak",
            birthYear: 1995,
            gender: "female",
            relationshipWithMe: "self",
          },
          papa: {
            name: "Rajesh",
            birthYear: 1965,
            relationshipWithMe: "Your father's name",
          },
        },
      },
    }).as("getCharactersWithData");

    mountComponent();

    cy.wait("@getCharactersWithData");

    cy.get('[data-testid="name-me"]').should("have.value", "Jhalak");
    cy.get('[data-testid="birthYear-me"]').should("have.value", "1995");
    cy.get('[data-testid="gender-me"]').should("have.value", "female");

    cy.get('[data-testid="name-papa"]').should("have.value", "Rajesh");
    cy.get('[data-testid="birthYear-papa"]').should("have.value", "1965");
  });

  it("should load custom characters from API", () => {
    cy.intercept("GET", "/api/get-characters-details", {
      statusCode: 200,
      body: {
        characterDetails: {
          custom_0: {
            name: "Best Friend",
            birthYear: 1996,
            gender: "male",
            relationshipWithMe: "Best Friend",
          },
        },
      },
    }).as("getCustomCharacters");

    mountComponent();

    cy.wait("@getCustomCharacters");

    cy.get('[data-testid="name-custom_0"]').should("have.value", "Best Friend");
    cy.get('[data-testid="birthYear-custom_0"]').should("have.value", "1996");
    cy.get('[data-testid="gender-custom_0"]').should("have.value", "male");
  });

  it("should handle API error gracefully when fetching characters", () => {
    cy.intercept("GET", "/api/get-characters-details", {
      statusCode: 500,
      body: { error: "Server error" },
    }).as("getCharactersError");

    mountComponent();

    // Component should still render despite API error
    cy.get('[data-testid="personalization-title"]').should("be.visible");
    cy.get('[data-testid="name-me"]').should("exist");
  });

  it("should handle API error when saving characters", () => {
    cy.intercept("POST", "/api/save-characters", {
      statusCode: 500,
      body: { status: "error", message: "Failed to save details" },
    }).as("saveCharactersError");

    mountComponent();

    cy.get('[data-testid="name-me"]').type("Jhalak");
    cy.get('[data-testid="save-details-button"]').click();

    cy.wait("@saveCharactersError");
    // Snackbar should show error message
  });

  it("should include all filled fields in save request", () => {
    mountComponent();

    cy.get('[data-testid="name-me"]').type("Jhalak");
    cy.get('[data-testid="birthYear-me"]').type("1995");
    cy.get('[data-testid="gender-me"]').select("female");

    cy.get('[data-testid="name-mummy"]').type("Sunita");
    cy.get('[data-testid="birthYear-mummy"]').type("1970");

    cy.get('[data-testid="save-details-button"]').click();

    cy.wait("@saveCharacters")
      .its("request.body.characterDetails")
      .should("have.keys", ["me", "mummy"]);
  });

  it("should properly format relationshipWithMe for default characters", () => {
    mountComponent();

    cy.get('[data-testid="name-papa"]').type("Rajesh");
    cy.get('[data-testid="birthYear-papa"]').type("1965");

    cy.get('[data-testid="save-details-button"]').click();

    cy.wait("@saveCharacters")
      .its("request.body")
      .should("deep.include", {
        characterDetails: {
          papa: {
            name: "Rajesh",
            birthYear: 1965,
            relationshipWithMe: "Your father's name",
          },
        },
      });
  });

  it("should update existing values when typing", () => {
    mountComponent();

    cy.get('[data-testid="name-me"]').type("John");
    cy.get('[data-testid="name-me"]').should("have.value", "John");

    cy.get('[data-testid="name-me"]').clear().type("Jane");
    cy.get('[data-testid="name-me"]').should("have.value", "Jane");
  });

  it("should show gender options correctly", () => {
    mountComponent();

    cy.get('[data-testid="gender-me"]').select("male");
    cy.get('[data-testid="gender-me"]').should("have.value", "male");

    cy.get('[data-testid="gender-me"]').select("female");
    cy.get('[data-testid="gender-me"]').should("have.value", "female");

    cy.get('[data-testid="gender-me"]').select("other");
    cy.get('[data-testid="gender-me"]').should("have.value", "other");
  });
});
