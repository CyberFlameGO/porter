import React, { useContext, useState, Component, useEffect } from "react";
import styled from "styled-components";

import { Context } from "shared/Context";
import api from "shared/api";

import { Infrastructure, KindMap } from "shared/types";

import TabSelector from "components/TabSelector";
import Loading from "components/Loading";
import TitleSection from "components/TitleSection";

import { hardcodedNames } from "shared/hardcodedNameDict";
import semver from "semver";
import {
  RouteComponentProps,
  useHistory,
  useLocation,
  withRouter,
} from "react-router";
import { getQueryParam, getQueryParams, pushFiltered } from "shared/routing";
import DocsHelper from "components/DocsHelper";
import PorterFormWrapper from "components/porter-form/PorterFormWrapper";
import yaml from "js-yaml";
import Placeholder from "components/Placeholder";
import AWSCredentialsList from "./credentials/AWSCredentialList";

type Props = {};

type InfraTemplate = {
  icon?: string;
  description: string;
  name: string;
  kind: string;
  version?: string;
  form: any;
  required_credential: CredentialOptions;
};

type CredentialOptions =
  | "aws_integration_id"
  | "gcp_integration_id"
  | "do_integration_id"
  | "";

type Credentials = {
  [key in CredentialOptions]?: number;
};

const ProvisionInfra: React.FunctionComponent<Props> = () => {
  const { currentProject, setCurrentError } = useContext(Context);
  const [templates, setTemplates] = useState<InfraTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<InfraTemplate>(null);
  const [currentCredential, setCurrentCredential] = useState<Credentials>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    if (currentProject) {
      api
        .listInfraTemplates(
          "<token>",
          {},
          {
            project_id: currentProject.id,
          }
        )
        .then(({ data }) => {
          if (!Array.isArray(data)) {
            throw Error("Data is not an array");
          }

          setTemplates(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setHasError(true);
          setCurrentError(err.response?.data?.error);
          setIsLoading(false);
        });
    }
  }, [currentProject]);

  const onSubmit = (values: any) => {
    setIsLoading(true);

    api
      .provisionInfra(
        "<token>",
        {
          kind: currentTemplate.kind,
          values: values,
          aws_integration_id: currentCredential["aws_integration_id"],
          do_integration_id: currentCredential["do_integration_id"],
          gcp_integration_id: currentCredential["gcp_integration_id"],
        },
        {
          project_id: currentProject.id,
        }
      )
      .then(({ data }) => {
        setIsLoading(false);

        if (data?.infra_id) {
          pushFiltered(
            { history, location },
            `/infrastructure/${data?.infra_id}`,
            ["project_id"]
          );
        } else {
          pushFiltered({ history, location }, `/infrastructure`, [
            "project_id",
          ]);
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  if (hasError) {
    return <Placeholder>Error</Placeholder>;
  }

  if (isLoading) {
    return (
      <Placeholder>
        <Loading />
      </Placeholder>
    );
  }

  const renderIcon = (icon: string) => {
    if (icon) {
      return <Icon src={icon} />;
    }

    return (
      <Polymer>
        <i className="material-icons">layers</i>
      </Polymer>
    );
  };

  const renderTemplates = () => {
    return templates.map((template) => {
      let { name, icon, description } = template;

      return (
        <TemplateBlock key={name} onClick={() => setCurrentTemplate(template)}>
          {renderIcon(icon)}
          <TemplateTitle>{name}</TemplateTitle>
          <TemplateDescription>{description}</TemplateDescription>
        </TemplateBlock>
      );
    });
  };

  const renderContents = () => {
    if (currentTemplate) {
      // if credentials need to be set and the list doesn't contain the necessary creds,
      // render a credentials form
      if (
        currentTemplate.required_credential != "" &&
        currentCredential == null
      ) {
        // TODO: case on the credential type
        return (
          <AWSCredentialsList
            selectCredential={(i) =>
              setCurrentCredential({
                aws_integration_id: i,
              })
            }
          />
        );
      }

      return (
        <PorterFormWrapper
          showStateDebugger={false}
          formData={currentTemplate.form}
          valuesToOverride={{}}
          isReadOnly={false}
          onSubmit={onSubmit}
          isInModal={false}
          hideBottomSpacer={false}
          // renderTabContents={renderTabContents}
          saveButtonText={"Provision"}
        />
      );
    }

    return renderTemplates();
  };

  return (
    <TemplatesWrapper>
      <TitleSection>Provision Infrastructure</TitleSection>
      <LineBreak />
      {renderContents()}
    </TemplatesWrapper>
  );
};

export default ProvisionInfra;

const LineBreak = styled.div`
  width: calc(100% - 0px);
  height: 2px;
  background: #ffffff20;
  margin: 10px 0px 35px;
`;

// class Templates extends Component<PropsType, StateType> {
//   state = {
//     currentTemplate: null as PorterTemplate | null,
//     form: null as any,
//     currentTab: "porter",
//     addonTemplates: [] as PorterTemplate[],
//     applicationTemplates: [] as PorterTemplate[],
//     loading: true,
//     error: false,
//     isOnLaunchFlow: false,
//     clonedChart: null as ChartTypeWithExtendedConfig,
//   };

//   async componentDidMount() {
//     try {
//       const res = await api.getTemplates(
//         "<token>",
//         {
//           repo_url: process.env.ADDON_CHART_REPO_URL,
//         },
//         {}
//       );
//       let sortedVersionData = res.data.map((template: any) => {
//         let versions = template.versions.reverse();

//         versions = template.versions.sort(semver.rcompare);

//         return {
//           ...template,
//           versions,
//           currentVersion: versions[0],
//         };
//       });
//       sortedVersionData.sort((a: any, b: any) => (a.name > b.name ? 1 : -1));
//       sortedVersionData = sortedVersionData.filter(
//         (template: any) => !HIDDEN_CHARTS.includes(template?.name)
//       );
//       this.setState({ addonTemplates: sortedVersionData, error: false });
//     } catch (error) {
//       this.setState({ loading: false, error: true });
//     }
//     try {
//       const res = await api.getTemplates(
//         "<token>",
//         {
//           repo_url: process.env.APPLICATION_CHART_REPO_URL,
//         },
//         {}
//       );
//       let sortedVersionData = res.data.map((template: any) => {
//         let versions = template.versions.reverse();

//         versions = template.versions.sort(semver.rcompare);

//         return {
//           ...template,
//           versions,
//           currentVersion: versions[0],
//         };
//       });

//       let currentTemplate = null;
//       let isOnLaunchFlow = false;
//       let form = null;
//       let clonedChart = null;
//       if (this.isTryingToClone() && this.areCloneQueryParamsValid()) {
//         isOnLaunchFlow = true;
//         const template_name = getQueryParam(this.props, "release_type");
//         const version = getQueryParam(this.props, "release_template_version");
//         currentTemplate = sortedVersionData.find(
//           (v: any) => v.name === template_name
//         );

//         console.log(currentTemplate);
//         if (currentTemplate.versions.find((v: any) => v === version)) {
//           currentTemplate.currentVersion = version;
//         }
//         const release = await this.getClonedRelease().then((res) => res.data);
//         form = release.form;
//         clonedChart = release;
//         if (release.git_action_config) {
//           this.context.setCurrentError(
//             "Application/Jobs deployed with GitHub are not supported for cloning yet!"
//           );
//           this.props.history.push("/dashboard");
//           return;
//         }
//         // If its not web worker or job it means is an addon, and for now it's not supported
//         if (
//           !["web", "worker", "job"].includes(release?.chart?.metadata?.name)
//         ) {
//           this.context.setCurrentError("Addons don't support cloning yet!");
//           this.props.history.push("/dashboard");
//           return;
//         }
//       }

//       this.setState(
//         {
//           applicationTemplates: sortedVersionData,
//           error: false,
//           currentTemplate,
//           isOnLaunchFlow,
//           form,
//           clonedChart,
//         },
//         () => {
//           let preferredOrder = ["web", "worker", "job"];
//           this.state.applicationTemplates.sort((a, b) => {
//             return (
//               preferredOrder.indexOf(a.name) - preferredOrder.indexOf(b.name)
//             );
//           });
//           this.setState({
//             loading: false,
//           });
//         }
//       );
//     } catch (error) {
//       this.setState({ loading: false, error: true });
//     }
//   }

//   isTryingToClone = () => {
//     const queryParams = getQueryParams(this.props);
//     return queryParams.has("shouldClone");
//   };

//   areCloneQueryParamsValid = () => {
//     const qp = getQueryParams(this.props);

//     const requiredParams = [
//       "release_namespace",
//       "release_template_version",
//       "release_name",
//       "release_version",
//       "release_type",
//     ];
//     // Check if we have all the params we need to make the request for the cloned app
//     // If the any param is missing then the some function will return true, so the validation
//     // went wrong.
//     return !requiredParams.some((rp) => !qp.has(rp));
//   };

//   getClonedRelease = () => {
//     const queryParams = getQueryParams(this.props);

//     if (!this.areCloneQueryParamsValid()) {
//       this.context.setCurrentError(
//         "Url has missing params to clone the app. Please try again."
//       );
//       this.props.history.push("/dashboard");
//       return;
//     }

//     return api.getChart<ChartTypeWithExtendedConfig>(
//       "<token>",
//       {},
//       {
//         id: this.context.currentProject.id,
//         name: queryParams.get("release_name"),
//         revision: 0,
//         namespace: queryParams.get("release_namespace"),
//         cluster_id: this.context?.currentCluster?.id,
//       }
//     );
//   };

//   renderIcon = (icon: string) => {
//     if (icon) {
//       return <Icon src={icon} />;
//     }

//     return (
//       <Polymer>
//         <i className="material-icons">layers</i>
//       </Polymer>
//     );
//   };

//   renderTemplateList = (templates: any) => {
//     let { loading, error } = this.state;

//     if (loading) {
//       return (
//         <LoadingWrapper>
//           <Loading />
//         </LoadingWrapper>
//       );
//     } else if (error) {
//       return (
//         <Placeholder>
//           <i className="material-icons">error</i> Error retrieving templates.
//         </Placeholder>
//       );
//     } else if (templates.length === 0) {
//       return (
//         <Placeholder>
//           <i className="material-icons">category</i> No templates found.
//         </Placeholder>
//       );
//     }

//     return (
//       <TemplateList>
//         {templates.map((template: PorterTemplate, i: number) => {
//           let { name, icon, description } = template;
//           if (hardcodedNames[name]) {
//             name = hardcodedNames[name];
//           }
//           return (
//             <TemplateBlock
//               key={name}
//               onClick={() => this.setState({ currentTemplate: template })}
//             >
//               {this.renderIcon(icon)}
//               <TemplateTitle>{name}</TemplateTitle>
//               <TemplateDescription>{description}</TemplateDescription>
//             </TemplateBlock>
//           );
//         })}
//       </TemplateList>
//     );
//   };

//   renderTabContents = () => {
//     if (this.state.currentTemplate) {
//       return (
//         <ExpandedTemplate
//           setForm={(x: any) => this.setState({ form: x })}
//           showLaunchFlow={() => this.setState({ isOnLaunchFlow: true })}
//           currentTab={this.state.currentTab}
//           currentTemplate={this.state.currentTemplate}
//           setCurrentTemplate={(currentTemplate: PorterTemplate) => {
//             this.setState({ currentTemplate });
//           }}
//         />
//       );
//     }
//     if (this.state.currentTab === "porter") {
//       return this.renderTemplateList(this.state.applicationTemplates);
//     } else {
//       return this.renderTemplateList(this.state.addonTemplates);
//     }
//   };

//   renderContents = () => {
//     if (this.context.currentCluster) {
//       return (
//         <>
//           <TabSelector
//             options={tabOptions}
//             currentTab={this.state.currentTab}
//             setCurrentTab={(value: string) =>
//               this.setState({
//                 currentTab: value,
//                 currentTemplate: null,
//               })
//             }
//           />
//           {this.renderTabContents()}
//         </>
//       );
//     } else if (this.context.currentCluster?.id === -1) {
//       return <Loading />;
//     } else if (!this.context.currentCluster) {
//       return (
//         <>
//           <Banner>
//             <i className="material-icons">error_outline</i>
//             No cluster connected to this project.
//           </Banner>
//           <NoClusterPlaceholder />
//         </>
//       );
//     }
//   };

//   render() {
//     if (this.isTryingToClone() && this.state.loading) {
//       return <Loading />;
//     }
//     if (!this.state.isOnLaunchFlow || !this.state.currentTemplate) {
//       return (
//         <TemplatesWrapper>
//           <TitleSection>
//             Launch
//             <a
//               href="https://docs.porter.run/deploying-applications/overview"
//               target="_blank"
//             >
//               <i className="material-icons">help_outline</i>
//             </a>
//           </TitleSection>
//           {this.renderContents()}
//         </TemplatesWrapper>
//       );
//     } else {
//       return (
//         <LaunchFlow
//           isCloning={this.isTryingToClone()}
//           clonedChart={this.state.clonedChart}
//           form={this.state.form}
//           currentTab={this.state.currentTab}
//           currentTemplate={this.state.currentTemplate}
//           hideLaunchFlow={() => this.setState({ isOnLaunchFlow: false })}
//         />
//       );
//     }
//   }
// }

// Templates.contextType = Context;

// export default withRouter(Templates);

// const Placeholder = styled.div`
//   padding-top: 200px;
//   width: 100%;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   color: #ffffff44;
//   font-size: 14px;

//   > i {
//     font-size: 18px;
//     margin-right: 12px;
//   }
// `;

// const Banner = styled.div`
//   height: 40px;
//   width: 100%;
//   margin: 30px 0 38px;
//   font-size: 13px;
//   display: flex;
//   border-radius: 5px;
//   padding-left: 15px;
//   align-items: center;
//   background: #ffffff11;
//   > i {
//     margin-right: 10px;
//     font-size: 18px;
//   }
// `;

// const Highlight = styled.div`
//   color: #8590ff;
//   cursor: pointer;
//   margin-left: 5px;
//   margin-right: 10px;
// `;

// const StyledStatusPlaceholder = styled.div`
//   width: 100%;
//   height: calc(100vh - 365px);
//   margin-top: 20px;
//   display: flex;
//   color: #aaaabb;
//   border-radius: 5px;
//   padding-bottom: 20px;
//   text-align: center;
//   font-size: 13px;
//   background: #ffffff09;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   font-family: "Work Sans", sans-serif;
//   user-select: text;
// `;

// const LoadingWrapper = styled.div`
//   padding-top: 300px;
// `;

const Icon = styled.img`
  height: 42px;
  margin-top: 35px;
  margin-bottom: 13px;
`;

const Polymer = styled.div`
  > i {
    font-size: 34px;
    margin-top: 38px;
    margin-bottom: 20px;
  }
`;

const TemplateDescription = styled.div`
  margin-bottom: 26px;
  color: #ffffff66;
  text-align: center;
  font-weight: default;
  padding: 0px 25px;
  height: 2.4em;
  font-size: 12px;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const TemplateTitle = styled.div`
  margin-bottom: 12px;
  width: 80%;
  text-align: center;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TemplateBlock = styled.div`
  border: 1px solid #ffffff00;
  align-items: center;
  user-select: none;
  border-radius: 8px;
  display: flex;
  font-size: 13px;
  font-weight: 500;
  padding: 3px 0px 5px;
  flex-direction: column;
  align-item: center;
  justify-content: space-between;
  height: 200px;
  cursor: pointer;
  color: #ffffff;
  position: relative;
  background: #26282f;
  box-shadow: 0 4px 15px 0px #00000044;
  :hover {
    background: #ffffff11;
  }

  animation: fadeIn 0.3s 0s;
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const TemplateList = styled.div`
  overflow: visible;
  margin-top: 35px;
  padding-bottom: 150px;
  display: grid;
  grid-column-gap: 25px;
  grid-row-gap: 25px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const TemplatesWrapper = styled.div`
  position: relative;
  min-width: 300px;
  margin: 0 auto;
`;

const StyledTitleSection = styled(TitleSection)`
  display: flex;
  align-items: center;
  width: 50%;
`;