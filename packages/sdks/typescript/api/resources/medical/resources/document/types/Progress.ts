/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as Metriport from "../../../../..";

/**
 * @example
 *     {
 *         status: Metriport.medical.DocumentQueryStatus.Processing
 *     }
 *
 * @example
 *     {
 *         status: Metriport.medical.DocumentQueryStatus.Completed,
 *         total: 100,
 *         successful: 98,
 *         errors: 2
 *     }
 */
export interface Progress {
    /** The status of querying document references across HIEs. */
    status: Metriport.medical.DocumentQueryStatus;
    /** The total number of documents to be queried. */
    total?: number;
    /** The number of documents successfully downloaded. */
    successful?: number;
    /** The number of documents that failed to download. */
    errors?: number;
}