import { PatchRequest } from "./Patch.js";
import { HTTPResponse } from "./SCIM.js";
import { SCIMUserPublic, SCIMUserResource } from "./User.js";

export type SCIMResourceType = SCIMUserResource;

export type SCIMPublicType = SCIMUserPublic;

export interface ListFilter {
  field: string;
  operator: string;
  value: string;
}

export abstract class ResourceActions {
  abstract create(resource: SCIMResourceType): Promise<HTTPResponse>;
  abstract list(
    query: { filter: any } | undefined | null
  ): Promise<HTTPResponse>;
  abstract update(
    resource: PatchRequest,
    resourceId: string
  ): Promise<HTTPResponse>;
  abstract delete(resourceId: string): Promise<HTTPResponse>;
  abstract get(resourceId: string): Promise<HTTPResponse>;

  abstract registerCreateDBCallback(
    callback: (resource: Partial<SCIMPublicType>) => Promise<SCIMPublicType>
  ): void;
  abstract registerListDBCallback(
    callback: (query: ListFilter) => Promise<SCIMPublicType[]>
  ): void;
  abstract registerUpdateDBCallback(
    callback: (
      resource: PatchRequest,
      resourceId: string
    ) => Promise<SCIMPublicType>
  ): void;
  abstract registerDeleteDBCallback(
    callback: (resourceId: string) => Promise<void>
  ): void;
  abstract registerGetDBCallback(
    callback: (resourceId: string) => Promise<SCIMPublicType>
  ): void;
}

export enum ResourceDBCallBackType {
  Create = "Create",
  List = "List",
  Update = "Update",
  Delete = "Delete",
  Get = "Get",
}

export class Resource {
  protected resultCallback = (statusCode: number, body: SCIMResourceType) => {
    return {
      statusCode: statusCode,
      body: body,
    };
  };
}
