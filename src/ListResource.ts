import { SCIMResourceType } from "./Resource.js";

export interface ListResource {
  schemas: string[];
  totalResults: number;
  Resources: SCIMResourceType[];
  startIndex: number;
  itemsPerPage: number;
}

export class ListResource {
  private resource = {
    schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
    itemsPerPage: 500,
    startIndex: 1,
  } as ListResource;
  constructor(resources: SCIMResourceType[]) {
    this.resource.totalResults = resources.length;
    this.resource.Resources = resources;
  }

  public getResource = () => {
    return this.resource;
  };
}
