import { Steps } from "main/home/onboarding/types";
import React, { useState } from "react";

import loading from "assets/loading.gif";

import styled from "styled-components";

type Props = {
  modules : TFModule[]
};

export interface TFModule {
  id: number
  kind: string
  resources: TFResource[]
}

export interface TFResource {
  addr: string,
  provisioned: boolean,
  error: string,
}

const nameMap : { [key: string]: string } = {
  "eks": "Elastic Kubernetes Service (EKS)",
  "ecr": "Elastic Container Registry (ECR)",
  "doks": "DigitalOcean Kubernetes Service (DOKS)",
  "docr": "DigitalOcean Container Registry (DOCR)",
}

const ProvisionerStatus: React.FC<Props> = (props) => {
  const { modules } = props;

  const renderStatus = (status: string) => {
    if (status === "successful") {
      return (
        <StatusIcon successful={true}>
          <i className="material-icons">done</i>
        </StatusIcon>
      );
    } else if (status === "loading") {
      return (
        <StatusIcon>
          <LoadingGif src={loading} />
        </StatusIcon>
      );
    } else if (status === "error") {
      return (
        <StatusIcon>
          <i className="material-icons">error_outline</i>
        </StatusIcon>
      );
    }
  };

  const renderModules = () => {
    return modules.map((val) => {
      const totalResources = val.resources?.length
      const provisionedResources = val.resources?.filter((resource) => {
        return resource.provisioned
      }).length

      var errors : string[] = []

      const hasError = val.resources?.filter((resource) => {
        if (resource.error !== "") {
          errors.push(resource.error)
        }

        return resource.error !== ""
      }).length > 0

      const width = 100 * (provisionedResources / (totalResources * 1.0))

      var error = null

      if (hasError) {
        error = errors.map((error) => {
          return <ExpandedError>{error}</ExpandedError>
        })
      }

      var loadingFill 
      var status 

      if (hasError) {
        loadingFill = <LoadingFill status="error" width={width + "%"} />
        status = renderStatus("error")
      } else if (width == 100) {
        loadingFill = <LoadingFill status="successful" width={width + "%"} />
        status = renderStatus("successful")
      } else {
        loadingFill = <LoadingFill status="loading" width={width + "%"} />
        status = renderStatus("loading")
      }

      return <InfraObject key={val.id}>
        <InfraHeader>
          {status}
          {nameMap[val.kind]}
        </InfraHeader>
        <LoadingBar>
          {loadingFill}
        </LoadingBar>
        {error}
      </InfraObject>
    })
  }

  return (
    <StyledProvisionerStatus>
        {renderModules()}
        {/* <InfraObject>
          <InfraHeader>
            {renderStatus("loading")}
            Elastic Kubernetes Service (EKS)
          </InfraHeader>
          <LoadingBar>
            <LoadingFill status="loading" width="90%" />
          </LoadingBar>
        </InfraObject>
        <InfraObject>
          <InfraHeader>
            {renderStatus("error")}
            Elastic Container Registry (ECR)
          </InfraHeader>
          <LoadingBar>
            <LoadingFill status="error" width="10%" />
          </LoadingBar>
          <ExpandedError>
            422 validation error: autoscaling failed because sometimes infrastructure is a bit mysterious and hard to predict.
          </ExpandedError>
        </InfraObject> */}
    </StyledProvisionerStatus>
  );
};

export default ProvisionerStatus;

const ExpandedError = styled.div`
  background: #ffffff22;
  border-radius: 5px;
  padding: 15px;
  font-size: 13px;
  font-family: monospace;
  border: 1px solid #aaaabb;
  margin-top: 17px;
`;

const LoadingFill = styled.div<{ width: string, status: string }>`
  width: ${props => props.width};
  background: ${props => props.status === "successful" ? "rgb(56, 168, 138)" : (
    props.status === "error" ? "#fcba03" : "linear-gradient(to right, #8ce1ff, #616FEE)"
  )};
  height: 100%;
  background-size: 250% 100%;
  animation: moving-gradient 2s infinite;
  animation-timing-function: ease-in-out;
  animation-direction: alternate;

  @keyframes moving-gradient {
    0% {
        background-position: left bottom;
    }

    100% {
        background-position: right bottom;
    }
  }​
`;

const StatusIcon = styled.div<{ successful?: boolean }>`
  display: flex;
  align-items: center;
  font-family: "Work Sans", sans-serif;
  font-size: 13px;
  color: #ffffff55;
  max-width: 500px;
  overflow: hidden;
  text-overflow: ellipsis;

  > i {
    font-size: 18px;
    margin-right: 10px;
    float: left;
    color: ${props => props.successful ? "rgb(56, 168, 138)" : "#fcba03"};
  }
`;

const LoadingGif = styled.img`
  width: 15px;
  height: 15px;
  margin-right: 9px;
  margin-bottom: 0px;
`;

const StyledProvisionerStatus = styled.div`
  margin-top: 25px;
`;

const LoadingBar = styled.div`
  width: 100%;
  background: #ffffff22;
  border: 100px;
  margin: 15px 0 0;
  height: 18px;
  overflow: hidden;
  border-radius: 100px;
`;

const InfraObject = styled.div`
  background: #ffffff22;
  padding: 15px 15px 17px;
  border: 1px solid #aaaabb;
  border-radius: 5px;
  margin-bottom: 10px;
`;

const InfraHeader = styled.div`
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
`;