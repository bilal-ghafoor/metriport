import {
  CodeableConcept,
  Observation,
  Period,
  Quantity,
  Ratio,
  SampledData,
} from "@medplum/fhirtypes";
import { LOINC_CODE, LOINC_OID, SNOMED_CODE, SNOMED_OID } from "../../util/constants";

export const observationStatus = [
  "entered-in-error",
  "unknown",
  "registered",
  "preliminary",
  "final",
  "amended",
  "corrected",
  "cancelled",
] as const;

export type ObservationStatus = (typeof observationStatus)[number];

export const statusRanking: Record<ObservationStatus, number> = {
  unknown: 0,
  "entered-in-error": 1,
  registered: 2,
  preliminary: 3,
  cancelled: 4,
  corrected: 5,
  amended: 6,
  final: 7,
};

export function extractCodes(concept: CodeableConcept | undefined): {
  loincCode: string | undefined;
  snomedCode: string | undefined;
  otherCode: string | undefined;
} {
  let loincCode = undefined;
  let snomedCode = undefined;
  let otherCode = undefined;
  if (!concept) return { loincCode, snomedCode, otherCode };

  if (concept && concept.coding) {
    for (const coding of concept.coding) {
      const system = coding.system?.toLowerCase();
      const code = coding.code?.trim().toLowerCase();
      if (system && code) {
        if (system.includes(LOINC_CODE) || system.includes(LOINC_OID)) {
          loincCode = code;
        } else if (system.includes(SNOMED_CODE) || system.includes(SNOMED_OID)) {
          snomedCode = code;
        } else {
          const display = coding.display?.trim().toLowerCase();
          const text = concept.text?.trim().toLowerCase();
          if (
            system.includes("unknown") &&
            code.includes(unknownCoding.code) &&
            display === unknownCoding.display.toLowerCase() &&
            (!text || text === unknownCode.text.toLowerCase())
          ) {
            // This identifies and ignores unknown codes
            continue;
          } else {
            otherCode = system + code;
          }
        }
      }
    }
  }
  return { loincCode, snomedCode, otherCode };
}

export function retrieveCode({
  loincCode,
  snomedCode,
  otherCode,
}: {
  loincCode: string | undefined;
  snomedCode: string | undefined;
  otherCode: string | undefined;
}): string | undefined {
  if (loincCode) return loincCode;
  if (snomedCode) return snomedCode;
  if (otherCode) return otherCode;
  return undefined;
}

export function extractValueFromObservation(
  observation: Observation
):
  | string
  | number
  | true
  | CodeableConcept
  | Quantity
  | Range
  | Ratio
  | SampledData
  | Period
  | undefined {
  if (observation.valueQuantity) {
    return observation.valueQuantity;
  } else if (observation.valueCodeableConcept) {
    return observation.valueCodeableConcept;
  } else if (observation.valueString) {
    return observation.valueString;
  } else if (observation.valueBoolean) {
    return observation.valueBoolean;
  } else if (observation.valueInteger) {
    return observation.valueInteger;
  } else if (observation.valueRange) {
    return observation.valueRange;
  } else if (observation.valueRatio) {
    return observation.valueRatio;
  } else if (observation.valueSampledData) {
    return observation.valueSampledData;
  } else if (observation.valueTime) {
    return observation.valueTime;
  } else if (observation.valueDateTime) {
    return observation.valueDateTime;
  } else if (observation.valuePeriod) {
    return observation.valuePeriod;
  }
  return undefined;
}

export const unknownCoding = {
  system: "http://terminology.hl7.org/valueset/v3-unknown",
  code: "unk",
  display: "unknown",
};

export const unknownCode = {
  coding: [unknownCoding],
  text: "unknown",
};