# FHIRDemo
 
Source Code for EWD.js FHIR Demo

Rob Tweed <rtweed@mgateway.com>  
28 March 2014, M/Gateway Developments Ltd [http://www.mgateway.com](http://www.mgateway.com)  

Twitter: @rtweed

Google Group for discussions, support, advice etc: [http://groups.google.co.uk/group/enterprise-web-developer-community](http://groups.google.co.uk/group/enterprise-web-developer-community)

##Contents

- userApplication: Source code for EWD.js user application that fetches and graphs blood pressure values

- node_modules: Source for back-end code for user application

- RESTServer: configuration file for EWD REST Server

- FHIRServer: 
  - ec2: FHIR parsing module running on EC2 server - serves up user-entered blood results
  - georgesServer: FHIR parsing and support modules running on George Lilly's server - serves up blood pressure
    results from CCDA held in JSON-formatted global storage


## License

 Copyright (c) 2013 M/Gateway Developments Ltd,                           
 Reigate, Surrey UK.                                                      
 All rights reserved.                                                     
                                                                           
  http://www.mgateway.com                                                  
  Email: rtweed@mgateway.com                                               
                                                                           
                                                                           
  Licensed under the Apache License, Version 2.0 (the "License");          
  you may not use this file except in compliance with the License.         
  You may obtain a copy of the License at                                  
                                                                           
      http://www.apache.org/licenses/LICENSE-2.0                           
                                                                           
  Unless required by applicable law or agreed to in writing, software      
  distributed under the License is distributed on an "AS IS" BASIS,        
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
  See the License for the specific language governing permissions and      
   limitations under the License.      
