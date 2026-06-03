// src/components/Controls.cy.tsx
import Controls from "../../components/Controls";
import { mount } from "@cypress/react";

describe("Controls Component", () => {
  let onTopicSelect: Cypress.Agent<sinon.SinonStub>;
  let setFontSize: Cypress.Agent<sinon.SinonStub>;

  let handleSpeak: Cypress.Agent<sinon.SinonStub>;
  let handlePause: Cypress.Agent<sinon.SinonStub>;
  let handleStop: Cypress.Agent<sinon.SinonStub>;

  beforeEach(() => {
    onTopicSelect = cy.stub().as("onTopicSelect");
    setFontSize = cy.stub().as("setFontSize");
    handleSpeak = cy.stub().as("handleSpeak");
    handlePause = cy.stub().as("handlePause");
    handleStop = cy.stub().as("handleStop");

    mount(
      <Controls
        onTopicSelect={onTopicSelect}
        fontSize={1.6}
        setFontSize={setFontSize}
        isSpeaking={false}
        isPaused={false}
        handleSpeak={handleSpeak}
        handlePause={handlePause}
        handleStop={handleStop}
        hasStory={false}
      />,
    );
  });

  it("renders all buttons and dropdown", () => {
    cy.contains("−").should("exist");
    cy.contains("+").should("exist");
    cy.contains("⛶").should("exist");
    cy.get("select").should("exist");
  });

  it("calls setFontSize when + or − is clicked", () => {
    cy.contains("+").click();
    cy.get("@setFontSize").should("have.been.calledWith", 1.8);

    cy.contains("−").click();
    cy.get("@setFontSize").should("have.been.called");
    cy.get("@setFontSize").then(() => {
      expect(setFontSize.getCall(1).args[0]).to.be.closeTo(1.4, 0.001);
    });
  });

  it("calls onTopicSelect when a topic is selected", () => {
    cy.get("select").select("magic");
    cy.get("@onTopicSelect").should("have.been.calledWith", "magic");
  });

  it("renders read aloud controls and handles interaction when story exists", () => {
    mount(
      <Controls
        onTopicSelect={onTopicSelect}
        fontSize={1.6}
        setFontSize={setFontSize}
        isSpeaking={false}
        isPaused={false}
        handleSpeak={handleSpeak}
        handlePause={handlePause}
        handleStop={handleStop}
        hasStory={true}
      />,
    );
    cy.get('[data-tip="Read Aloud"] button').should("exist").click();
    cy.get("@handleSpeak").should("have.been.calledOnce");
  });
});
