import { PatientResource } from "@metriport/shared/interface/external/athenahealth/patient";
import { normalizeDate, normalizeGender } from "@metriport/shared";
import { executeAsynchronously } from "@metriport/core/util/concurrency";
import { out } from "@metriport/core/util/log";
import { capture } from "@metriport/core/util/notifications";
import { errorToString } from "@metriport/shared";
import { Patient, PatientDemoData } from "@metriport/core/domain/patient";
import { getPatient as getAthenaPatient } from "@metriport/core/external/athenahealth/get-patient";
import { EhrSources } from "../../shared";
import {
  getPatient as getMetriportPatient,
  getPatientByDemo as singleGetMetriportPatientByDemo,
} from "../../../../command/medical/patient/get-patient";
import { getPatientMapping, findOrCreatePatientMapping } from "../../../../command/mapping/patient";
import { Config } from "../../../../shared/config";
import { createMetriportAddresses, createMetriportContacts } from "../shared";

const athenaUrl = Config.getAthenaHealthUrl();

export async function getPatient({
  accessToken,
  cxId,
  athenaPatientId,
}: {
  accessToken: string;
  cxId: string;
  athenaPatientId: string;
}): Promise<Patient | undefined> {
  const { log } = out(`AthenaHealth getPatient - cxId ${cxId} athenaPatientId ${athenaPatientId}`);
  const existingPatient = await getPatientMapping({
    cxId,
    externalId: athenaPatientId,
    source: EhrSources.ATHENA,
  });
  if (existingPatient) {
    return await getMetriportPatient({ cxId, id: existingPatient.patientId });
  }
  if (!athenaUrl) throw new Error("Athenahealth url not defined");
  const athenaPatient = await getAthenaPatient({
    cxId,
    accessToken,
    baseUrl: athenaUrl,
    patientId: athenaPatientId,
  });
  if (!athenaPatient) return undefined;
  if (athenaPatient.name.length === 0) {
    throw new Error("AthenaHealth patient missing at least one name");
  }
  if (athenaPatient.address.length === 0) {
    throw new Error("AthenaHealth patient missing at least one address");
  }

  const patientDemos = createMetriportPatientDemos(athenaPatient);
  const patients: Patient[] = [];
  const getPatientByDemoWrapperErrors: string[] = [];

  await executeAsynchronously(
    patientDemos.map(demo => {
      return { cxId, demo, patients, errors: getPatientByDemoWrapperErrors, log };
    }),
    getPatientByDemo,
    { numberOfParallelExecutions: 5 }
  );

  if (getPatientByDemoWrapperErrors.length > 0) {
    capture.error("Failed to get patient by demo", {
      extra: {
        cxId,
        patientCreateCount: patientDemos.length,
        errorCount: getPatientByDemoWrapperErrors.length,
        errors: getPatientByDemoWrapperErrors.join(","),
        context: "athenahealth.get-patient",
      },
    });
  }

  const metriportPatient = patients[0];
  if (metriportPatient) {
    const uniquePatientIds = new Set(patients.map(patient => patient.id));
    if (uniquePatientIds.size > 1) {
      capture.message("AthenaHealth patient mapping to more than one Metriport patient", {
        extra: {
          cxId,
          patientCreateCount: patientDemos.length,
          patientIds: uniquePatientIds,
          context: "athenahealth.get-patient",
        },
        level: "warning",
      });
    }
    await findOrCreatePatientMapping({
      cxId,
      patientId: metriportPatient.id,
      externalId: athenaPatientId,
      source: EhrSources.ATHENA,
    });
  }
  return metriportPatient;
}

function createMetriportPatientDemos(patient: PatientResource): PatientDemoData[] {
  const patientPatients: PatientDemoData[] = [];
  const addressArray = createMetriportAddresses(patient);
  const contactArray = createMetriportContacts(patient);
  patient.name.map(name => {
    const lastName = name.family;
    name.given.map(firstName => {
      patientPatients.push({
        firstName,
        lastName,
        dob: normalizeDate(patient.birthDate),
        genderAtBirth: normalizeGender(patient.gender),
        address: addressArray,
        contact: contactArray,
      });
    });
  });
  return patientPatients;
}

async function getPatientByDemo({
  cxId,
  demo,
  patients,
  errors,
  log,
}: {
  cxId: string;
  demo: PatientDemoData;
  patients: Patient[];
  errors: string[];
  log: typeof console.log;
}): Promise<void> {
  try {
    const patient = await singleGetMetriportPatientByDemo({ cxId, demo });
    if (patient) patients.push(patient);
  } catch (error) {
    const msg = `Failed to get patient by demo. Cause: ${errorToString(error)}`;
    log(msg);
    errors.push(msg);
  }
}