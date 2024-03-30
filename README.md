# Node-SCIM

SCIM (System for cross-domain Identity Management) is an industry standard definition used vastly between enterprise applications to securely exchange lifecycle information for resources such as Users and Groups. It is primarly used to provision/deprovision users within a service provider application by an IdP(Identity provider). It can also be extended to provision other custom resource types.

## Motivation

Althought the SCIM defintions are not complex, the implementation of fields can be tedious and time consuming. Since the request/response structure is strictly enforced, small mistakes will cause the entire implementation to not work. Not to mention, it is hard to debug since you need to send specific requests which are generally only invoked by an IdP. This module aims to do the heavy lifting in the background and pprovides straightforward APIs so that you can focus on the integration into your app, instead of implementing the standard from scratch.

## Issues

Please report any issue or bugs that are found while using the library. You can also open any PRs that address issues or add additional features.

## Roadmap

Currently only the User and Enterprise User resources are supported.

Group resource support is on the near roadmap. Custom resource definitions are planned but will require community support to complete.
