[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-admin&metric=alert_status)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-admin)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-admin&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-admin)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-admin&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-admin)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-admin&metric=security_rating)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-admin)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-admin&metric=ncloc)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-admin)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-admin&metric=bugs)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-admin)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-admin&metric=code_smells)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-admin)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-admin&metric=sqale_index)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-admin)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-admin&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-admin)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![GitHub issues](https://img.shields.io/github/issues/DEFRA/cyltfr-admin.svg)](https://github.com/DEFRA/cyltfr-admin/issues/)
[![Code size](https://img.shields.io/github/languages/code-size/DEFRA/cyltfr-admin.svg)]()
[![Repo size](https://img.shields.io/github/repo-size/DEFRA/cyltfr-admin.svg)]()
[![Licence](https://img.shields.io/badge/licence-OGLv3-blue.svg)](http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3)

# Check Your Long Term Flood Risk Services (cyltfr-admin)
This is the Check Your Long Term Flood Risk (CYLTFR) management tool.

This repository is part of the CYLTFR service which also includes:\
<https://github.com/DEFRA/cyltfr-app>\
<https://github.com/DEFRA/cyltfr-service>\
<https://github.com/DEFRA/cyltfr-data>


## Prerequisites
Node v22.x/ 
Docker v20.10.0+

## Environment variables

| name                    | description      | required |        default        |       valid        | notes |
|-------------------------|------------------|:--------:|-----------------------|:------------------:|-------|
| NODE_ENV                | Environment name |    no    | dev                   | dev,test,prod-green,prod-blue    |       |
| PORT                    | Port number      |    no    | 3000                  |                    |       |
| AD_CLIENT_ID            | AD Client Id     |    yes   |                       |                    |       |
| AD_CLIENT_SECRET        | AD Client Secret |    yes   |                       |                    |       |
| AD_TENANT               | AD Tenant        |    yes   |                       |                    |       |
| AD_COOKIE_PASSWORD      | Cookie password  |    yes   |                       |                    |       |
| IS_SECURE               | Secure cookie    |    no    | false                 |                    |       |
| FORCE_HTTPS             | Force https      |    no    | false                 |                    |       |
| HOME_PAGE               | Home page        |    no    | http://localhost:3000 |                    |       |
| AWS_BUCKET_REGION       |                  |    yes   |                       |                    |       |
| AWS_BUCKET_NAME         |                  |    yes   |                       |                    |       |
| HOLDING_COMMENTS_PREFIX |                  |    no    | holding-comments      |                    |       |
| MANIFEST_FILENAME       |                  |    no    | manifest.json         |                    |       |

## Running the application

First build the application using:

`$ npm run build`

This will build the css based on the `govuk-frontend` scss/styles.

Now the application is ready to run:

`$ node index.js`

Building the docker container

`npm run build:container`

Starting the docker container

`npm run start:container`

Removing (all) docker container

`docker rm -f -v $(docker ps -a -q)`

Initiailise a bash session in the running container

`docker exec -it ltfmgmt bash`


Notes
-----

If you want to debug locally and not run the docker container but don't have `ogr2ogr` installed
change the shp2json file to return the mock geojson on line 24.

## License
THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

>Contains public sector information licensed under the Open Government licence v3

### About the license
The Open Government Licence (OGL) was developed by the Controller of His Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.