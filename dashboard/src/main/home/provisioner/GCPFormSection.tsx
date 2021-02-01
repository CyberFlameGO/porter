import React, { Component } from 'react';
import styled from 'styled-components';

import close from '../../../assets/close.png';
import { isAlphanumeric } from '../../../shared/common';
import api from '../../../shared/api';
import { Context } from '../../../shared/Context';
import { ProjectType, InfraType } from '../../../shared/types';

import SelectRow from '../../../components/values-form/SelectRow';
import InputRow from '../../../components/values-form/InputRow';
import Helper from '../../../components/values-form/Helper';
import Heading from '../../../components/values-form/Heading';
import SaveButton from '../../../components/SaveButton';
import CheckboxList from '../../../components/values-form/CheckboxList';

type PropsType = {
  setSelectedProvisioner: (x: string | null) => void,
  handleError: () => void,
  projectName: string,
  setCurrentView: (x: string | null, data?: any) => void,
  infras: InfraType[],
};

type StateType = {
  gcpRegion: string,
  gcpProjectId: string,
  gcpKeyData: string,
  selectedInfras: { value: string, label: string }[],
  buttonStatus: string,
};

const provisionOptions = [
  { value: 'gcr', label: 'Google Container Registry (GCR)' },
  { value: 'gke', label: 'Google Kubernetes Engine (GKE)' },
];

const regionOptions = [
  { value: 'asia-east1', label: 'asia-east1' },
  { value: 'asia-east2', label: 'asia-east2' },
  { value: 'asia-northeast1', label: 'asia-northeast1' },
  { value: 'asia-northeast2', label: 'asia-northeast2' },
  { value: 'asia-northeast3', label: 'asia-northeast3' },
  { value: 'asia-south1', label: 'asia-south1' },
  { value: 'asia-southeast1', label: 'asia-southeast1' },
  { value: 'asia-southeast2', label: 'asia-southeast2' },
  { value: 'australia-southeast1', label: 'australia-southeast1' },
  { value: 'europe-north1', label: 'europe-north1' },
  { value: 'europe-west1', label: 'europe-west1' },
  { value: 'europe-west2', label: 'europe-west2' },
  { value: 'europe-west3', label: 'europe-west3' },
  { value: 'europe-west4', label: 'europe-west4' },
  { value: 'europe-west6', label: 'europe-west6' },
  { value: 'northamerica-northeast1', label: 'northamerica-northeast1' },
  { value: 'southamerica-east1', label: 'southamerica-east1' },
  { value: 'us-central1', label: 'us-central1' },
  { value: 'us-east1', label: 'us-east1' },
  { value: 'us-east4', label: 'us-east4' },
  { value: 'us-west1', label: 'us-west1' },
  { value: 'us-west2', label: 'us-west2' },
  { value: 'us-west3', label: 'us-west3' },
  { value: 'us-west4', label: 'us-west4' },
]

export default class GCPFormSection extends Component<PropsType, StateType> {
  state = {
    gcpRegion: 'us-east1',
    gcpProjectId: '',
    gcpKeyData: '',
    selectedInfras: [...provisionOptions],
    buttonStatus: '',
  }

  componentDidMount = () => {
    let { infras } = this.props;
    let { selectedInfras } = this.state;

    if (infras) {
      
      // From the dashboard, only uncheck and disable if "creating" or "created"
      let filtered = selectedInfras;
      infras.forEach(
        (infra: InfraType, i: number) => {
          let { kind, status } = infra;
          if (status === 'creating' || status === 'created') {
            filtered = filtered.filter((item: any) => {
              return item.value !== kind;
            });
          }
        }
      );
      this.setState({ selectedInfras: filtered });
    }
  }

  checkFormDisabled = () => {
    let { 
      gcpRegion,
      gcpProjectId, 
      gcpKeyData, 
      selectedInfras,
    } = this.state;
    let { projectName } = this.props;
    if (projectName || projectName === '') {
      return (
        !isAlphanumeric(projectName) 
          || !(gcpProjectId !== '' && gcpKeyData !== '' && gcpRegion !== '')
          || selectedInfras.length === 0
      );
    } else {
      return (
        !(gcpProjectId !== '' && gcpKeyData !== '' && gcpRegion !== '')
          || selectedInfras.length === 0
      );
    }
  }

  // Step 1: Create a project
  createProject = (callback?: any) => {
    console.log('Creating project');
    let { projectName, handleError } = this.props;
    let { 
      user, 
      setProjects, 
      setCurrentProject, 
    } = this.context;

    api.createProject('<token>', { name: projectName }, {
    }, (err: any, res: any) => {
      if (err) {
        console.log(err);
        handleError();
        return;
      } else {
        let proj = res.data;

        // Need to set project list for dropdown
        // TODO: consolidate into ProjectSection (case on exists in list on set)
        api.getProjects('<token>', {}, { 
          id: user.userId 
        }, (err: any, res: any) => {
          if (err) {
            console.log(err);
            handleError();
            return;
          }
          setProjects(res.data);
          setCurrentProject(proj);
          callback && callback();
        });
      }
    });
  }

  provisionGCR = (id: number, callback?: any) => {
    console.log('Provisioning GCR')
    let { currentProject } = this.context;
    let { handleError } = this.props;

    api.createGCR('<token>', {
      gcp_integration_id: id,
    }, { project_id: currentProject.id }, (err: any, res: any) => {
      if (err) {
        console.log(err);
        handleError();
        return;
      }
      callback && callback();
    });
  }

  provisionGKE = (id: number) => {
    console.log('Provisioning GKE');
    let { setCurrentView, handleError } = this.props;
    let { currentProject } = this.context;

    let clusterName = `${currentProject.name}-cluster`
    api.createGKE('<token>', {
      gke_name: clusterName,
      gcp_integration_id: id,
    }, { project_id: currentProject.id }, (err: any, res: any) => {
      if (err) {
        console.log(err);
        handleError();
        return;
      }
      setCurrentView('provisioner');
    })
  }

  handleCreateFlow = () => {
    let { setCurrentView } = this.props;
    let { selectedInfras, gcpKeyData, gcpProjectId, gcpRegion } = this.state;
    let { currentProject } = this.context;
    api.createGCPIntegration('<token>', {
      gcp_region: gcpRegion,
      gcp_key_data: gcpKeyData,
      gcp_project_id: gcpProjectId,
    }, { project_id: currentProject.id }, (err: any, res: any) => {
      if (err) {
        console.log(err);
      } else if (res?.data) {
        console.log('gcp provisioned with response: ', res.data);
        let { id } = res.data;

        if (selectedInfras.length === 2) {
          // Case: project exists, provision GCR + GKE
          this.provisionGCR(id, () => this.provisionGKE(id));
        } else if (selectedInfras[0].value === 'gcr') {
          // Case: project exists, only provision GCR
          this.provisionGCR(id, () => setCurrentView('provisioner'));
        } else {
          // Case: project exists, only provision GKE
          this.provisionGKE(id);
        }
      }
    });
  }

  // TODO: handle generically (with > 2 steps)
  onCreateGCP = () => {
    let { projectName } = this.props;

    if (!projectName) {
      this.handleCreateFlow();
    } else {
      this.createProject(this.handleCreateFlow);
    }
  }

  render() {
    let { setSelectedProvisioner } = this.props;
    let {
      gcpRegion,
      gcpProjectId,
      gcpKeyData,
      selectedInfras,
    } = this.state;

    return (
      <StyledGCPFormSection>
        <FormSection>
          <CloseButton onClick={() => setSelectedProvisioner(null)}>
            <CloseButtonImg src={close} />
          </CloseButton>
          <Heading isAtTop={true}>
            GCP Credentials
            <GuideButton 
              href='https://docs.getporter.dev/docs/getting-started-on-gcp'
              target='_blank'
            >
              <i className="material-icons-outlined">help</i> 
              Guide
            </GuideButton>
          </Heading>
          <SelectRow
            options={regionOptions}
            width='100%'
            value={gcpRegion}
            dropdownMaxHeight='240px'
            setActiveValue={(x: string) => this.setState({ gcpRegion: x })}
            label='📍 GCP Region'
          />
          <InputRow
            type='text'
            value={gcpProjectId}
            setValue={(x: string) => this.setState({ gcpProjectId: x })}
            label='🏷️ GCP Project ID'
            placeholder='ex: blindfold-ceiling-24601'
            width='100%'
            isRequired={true}
          />
          <InputRow
            type='password'
            value={gcpKeyData}
            setValue={(x: string) => this.setState({ gcpKeyData: x })}
            label='🔒 GCP Key Data (JSON)'
            placeholder='○ ○ ○ ○ ○ ○ ○ ○ ○'
            width='100%'
            isRequired={true}
          />
          <Br />
          <Heading>GCP Resources</Heading>
          <Helper>Porter will provision the following GCP resources</Helper>
          <CheckboxList
            options={provisionOptions}
            selected={selectedInfras}
            setSelected={(x: { value: string, label: string }[]) => {
              this.setState({ selectedInfras: x });
            }}
          />
        </FormSection>
        {this.props.children ? this.props.children : <Padding />}
        <SaveButton
          text='Submit'
          disabled={this.checkFormDisabled()}
          onClick={this.onCreateGCP}
          makeFlush={true}
          helper='Note: Provisioning can take up to 15 minutes'
        />
      </StyledGCPFormSection>
    );
  }
}

GCPFormSection.contextType = Context;

const Padding = styled.div`
  height: 15px;
`;

const Br = styled.div`
  width: 100%;
  height: 2px;
`;

const StyledGCPFormSection = styled.div`
  position: relative;
  padding-bottom: 35px;
`;

const FormSection = styled.div`
  background: #ffffff11;
  margin-top: 25px;
  background: #26282f;
  border-radius: 5px;
  margin-bottom: 25px;
  padding: 25px;
  padding-bottom: 16px;
  font-size: 13px;
  animation: fadeIn 0.3s 0s;
  position: relative;
`;

const CloseButton = styled.div`
  position: absolute;
  display: block;
  width: 40px;
  height: 40px;
  padding: 13px 0 12px 0;
  z-index: 1;
  text-align: center;
  border-radius: 50%;
  right: 15px;
  top: 12px;
  cursor: pointer;
  :hover {
    background-color: #ffffff11;
  }
`;

const GuideButton = styled.a`
  display: flex;
  align-items: center;
  margin-left: 20px;
  color: #aaaabb;
  font-size: 13px;
  margin-bottom: -1px;
  border: 1px solid #aaaabb;
  padding: 5px 10px;
  padding-left: 6px;
  border-radius: 5px;
  cursor: pointer;
  :hover {
    background: #ffffff11;
    color: #ffffff;
    border: 1px solid #ffffff;

    > i {
      color: #ffffff;
    }
  }

  > i {
    color: #aaaabb;
    font-size: 16px;
    margin-right: 6px;
  }
`;

const CloseButtonImg = styled.img`
  width: 14px;
  margin: 0 auto;
`;