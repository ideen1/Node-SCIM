import { User } from "./User.js";

export enum RegisterCallBackType {
  GroupCreate = "GroupCreate",
  GroupList = "GroupList",
  GroupUpdate = "GroupUpdate",
  GroupDelete = "GroupDelete",
  GroupGet = "GroupGet",
}

export type HTTPResponse = {
  statusCode: number;
  body: string;
  error?: string | undefined;
};

export class SCIM {
  private supportedResources = ["User"];
  private user = new User();

  constructor() {}

  /**
   * Extracts the ID from a given path.
   *
   * @param path - The path from which to extract the ID.
   * @returns The extracted ID.
   */
  private extractPath = (path: string) => {
    const pathParts = path.split("/");
    const id = pathParts[pathParts.length - 1];
    return id;
  };

  /**
   * Extracts the value from a query string.
   *
   * @param query - The query string to extract the value from.
   * @returns The extracted value from the query string.
   */
  private extractQuery = (query: string) => {
    const queryParts = query.split("=");
    return queryParts[1];
  };

  private pathHasId = (path: string) => {
    // see if path contains something after a slash
    const pathParts = path.split("/");
    return pathParts.length > 1;
  };

  private pathHasQuery = (path: string) => {
    // see if path contains a query string
    const pathParts = path.split("?");
    return pathParts.length > 1;
  };

  private schemaResponse = () => {
    return {
      statusCode: 200,
      body: JSON.stringify({
        schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
        itemsPerPage: 50,
        startIndex: 1,
        totalResults: 3,
        Resources: [
          {
            schemas: ["urn:ietf:params:scim:schemas:core:2.0:Schema"],
            id: "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User",
            name: "EnterpriseUser",
            description: "Enterprise User",
            attributes: [
              {
                name: "employeeNumber",
                type: "string",
                multiValued: false,
                description:
                  "Numeric or alphanumeric identifier assignedto a person, typically based on order of hire or association with anorganization.",
                required: false,
                caseExact: false,
                mutability: "readWrite",
                returned: "default",
                uniqueness: "none",
              },
            ],
            meta: {
              resourceType: "Schema",
              location:
                "/v2/Schemas/urn:ietf:params:scim:schemas:extension:enterprise:2.0:User",
            },
          },
        ],
      }),
    };
  };

  /**
   * Handles the SCIM requests.
   *
   * @param request - The SCIM request object.
   */
  private requestHandlerV2 = async (request: {
    body: string | null;
    httpMethod: string | null;
    query?: string;
    [name: string]: any;
  }): Promise<HTTPResponse> => {
    if (request.body) {
      const parsedBody = JSON.parse(request.body);
      if (request.httpMethod === "POST" && request.path === "/Users") {
        return this.user.create(parsedBody);
      }
      if (request.httpMethod === "PATCH" && this.pathHasId(request.path)) {
        return this.user.update(parsedBody, this.extractPath(request.path));
      }
    }

    if (request.httpMethod === "GET" && request.path === "/Users") {
      return this.user.list(this.extractQuery(request.path));
    }
    if (request.httpMethod === "GET" && this.pathHasId(request.path)) {
      return this.user.get(this.extractPath(request.path));
    }

    if (request.httpMethod === "DELETE" && this.pathHasId(request.path)) {
      return this.user.delete(this.extractPath(request.path));
    }
    if (request.httpMethod === "GET" && request.path === "/Schemas") {
      return this.schemaResponse();
    }

    return {
      statusCode: 400,
      body: "Bad Request",
    };

    // if (request.httpMethod === "GET" && request.path === "/Groups") {
    //   selectedType = RegisterCallBackType.GroupList;
    // }
    // if (request.httpMethod === "POST" && request.path === "/Groups") {
    //   selectedType = RegisterCallBackType.GroupCreate;
    // }
    // if (request.httpMethod === "PATCH" && request.path === "/Groups/:id") {
    //   selectedType = RegisterCallBackType.GroupUpdate;
    // }
    // if (request.httpMethod === "DELETE" && request.path === "/Groups/:id") {
  };

  public registerDBCallback = {
    User: {
      create: this.user.registerCreateDBCallback,
      list: this.user.registerListDBCallback,
      update: this.user.registerUpdateDBCallback,
      delete: this.user.registerDeleteDBCallback,
      get: this.user.registerGetDBCallback,
    },
  };

  configure = () => {};

  /**
   * Starts the SCIM handler by invoking the request handler.
   *
   * @param request - The request object containing the body, httpMethod, and other properties.
   */
  start = async (request: {
    body: string | null;
    httpMethod: string | null;
    [name: string]: any;
  }): Promise<HTTPResponse> => {
    return await this.requestHandlerV2(request);
  };
}
