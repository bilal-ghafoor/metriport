/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeCondition } from "../../../../fhir-to-cda/cda-templates/components/__tests__/make-condition";
import { uuidv7 } from "../../../../util/uuid-v7";
import { makeAllergyIntollerance } from "../../__tests__/allergy-intolerance";
import { makeBundle } from "../../__tests__/bundle";
import { makePatient } from "../../__tests__/patient";
import { makeReferece } from "../../__tests__/reference";
import { checkBundleForPatient } from "../qa";

describe("Bundle QA", () => {
  describe("checkBundleForPatient", () => {
    it(`returns true when only the expected patient is in the bundle`, async () => {
      const cxId = uuidv7();
      const patient = makePatient();
      const bundle = makeBundle({
        entries: [makeAllergyIntollerance({ patient }), makeAllergyIntollerance({ patient })],
      });
      const res = checkBundleForPatient(bundle, cxId, patient.id);
      expect(res).toBeTruthy();
    });
    it(`returns true when the bundle is empty`, async () => {
      const cxId = uuidv7();
      const patient = makePatient();
      const bundle = makeBundle({ entries: [] });
      const res = checkBundleForPatient(bundle, cxId, patient.id);
      expect(res).toBeTruthy();
    });
    it(`throw when the bundle w/ AllergyIntollerance has a diff patient`, async () => {
      const cxId = uuidv7();
      const patient1 = makePatient();
      const patient2 = makePatient();
      const bundle = makeBundle({
        entries: [
          makeAllergyIntollerance({ patient: patient1 }),
          makeAllergyIntollerance({ patient: patient2 }),
        ],
      });
      expect(() => checkBundleForPatient(bundle, cxId, patient1.id)).toThrow(
        "Bundle contains invalid data"
      );
    });
    it(`throw when the bundle w/ Condition has a diff patient`, async () => {
      const cxId = uuidv7();
      const patient1 = makePatient();
      const patient2 = makePatient();
      const bundle = makeBundle({
        entries: [
          makeCondition({ subject: makeReferece(patient1) }),
          makeCondition({ subject: makeReferece(patient2) }),
        ],
      });
      expect(() => checkBundleForPatient(bundle, cxId, patient1.id)).toThrow(
        "Bundle contains invalid data"
      );
    });
  });
});