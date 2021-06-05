package client_test

// import (
// 	"context"
// 	"testing"

// 	api "github.com/porter-dev/porter/api/client"
// 	"github.com/porter-dev/porter/internal/models"

// 	"github.com/porter-dev/porter/client"
// )

// func initProject(name string, client *client.Client, t *testing.T) *client.CreateProjectResponse {
// 	t.Helper()

// 	resp, err := client.CreateProject(context.Background(), &client.CreateProjectRequest{
// 		Name: name,
// 	})

// 	if err != nil {
// 		t.Fatalf("%v\n", err)
// 	}

// 	return resp
// }

// func initProjectCandidate(
// 	projectID uint,
// 	kubeconfig string,
// 	client *api.Client,
// 	t *testing.T,
// ) *models.ClusterCandidateExternal {
// 	t.Helper()

// 	resp, err := client.CreateProjectCandidates(
// 		context.Background(),
// 		projectID,
// 		&api.CreateProjectCandidatesRequest{
// 			Kubeconfig: kubeconfig,
// 		},
// 	)

// 	if err != nil {
// 		t.Fatalf("%v\n", err)
// 	}

// 	return resp[0]
// }

// func initProjectCluster(
// 	projectID uint,
// 	candidateID uint,
// 	client *api.Client,
// 	t *testing.T,
// ) *api.CreateProjectClusterResponse {
// 	t.Helper()

// 	resp, err := client.CreateProjectCluster(
// 		context.Background(),
// 		projectID,
// 		candidateID,
// 		&models.ClusterResolverAll{
// 			OIDCIssuerCAData: "LS0tLS1CRUdJTiBDRVJ=",
// 		},
// 	)

// 	if err != nil {
// 		t.Fatalf("%v\n", err)
// 	}

// 	return resp
// }

// func TestCreateProject(t *testing.T) {
// 	email := "create_project_test@example.com"
// 	client := api.NewClient(baseURL, "cookie_create_project_test.json")
// 	user := initUser(email, client, t)
// 	client.Login(context.Background(), &api.LoginRequest{
// 		Email:    user.Email,
// 		Password: "hello1234",
// 	})

// 	resp, err := client.CreateProject(context.Background(), &api.CreateProjectRequest{
// 		Name: "project-test",
// 	})

// 	if err != nil {
// 		t.Fatalf("%v\n", err)
// 	}

// 	// make sure user is admin and project name is correct
// 	if resp.Name != "project-test" {
// 		t.Errorf("project name incorrect: expected %s, got %s\n", "project-test", resp.Name)
// 	}

// 	if len(resp.Roles) != 1 {
// 		t.Fatalf("project role length is not 1")
// 	}

// 	if resp.Roles[0].Kind != models.RoleAdmin {
// 		t.Errorf("project role kind is incorrect: expected %s, got %s\n", models.RoleAdmin, resp.Roles[0].Kind)
// 	}

// 	if resp.Roles[0].UserID != user.ID {
// 		t.Errorf("project role user_id is incorrect: expected %d, got %d\n", user.ID, resp.Roles[0].UserID)
// 	}
// }

// func TestGetProject(t *testing.T) {
// 	email := "get_project_test@example.com"
// 	client := api.NewClient(baseURL, "cookie_get_project_test.json")
// 	user := initUser(email, client, t)
// 	client.Login(context.Background(), &api.LoginRequest{
// 		Email:    user.Email,
// 		Password: "hello1234",
// 	})
// 	project := initProject("project-test", client, t)

// 	resp, err := client.GetProject(context.Background(), project.ID)

// 	if err != nil {
// 		t.Fatalf("%v\n", err)
// 	}

// 	// make sure user is admin and project name is correct
// 	if resp.Name != "project-test" {
// 		t.Errorf("project name incorrect: expected %s, got %s\n", "project-test", resp.Name)
// 	}

// 	if len(resp.Roles) != 1 {
// 		t.Fatalf("project role length is not 1")
// 	}

// 	if resp.Roles[0].Kind != models.RoleAdmin {
// 		t.Errorf("project role kind is incorrect: expected %s, got %s\n", models.RoleAdmin, resp.Roles[0].Kind)
// 	}

// 	if resp.Roles[0].UserID != user.ID {
// 		t.Errorf("project role user_id is incorrect: expected %d, got %d\n", user.ID, resp.Roles[0].UserID)
// 	}
// }

// func TestGetProjectServiceAccount(t *testing.T) {
// 	email := "get_project_sa_test@example.com"
// 	client := api.NewClient(baseURL, "cookie_get_project_sa_test.json")
// 	user := initUser(email, client, t)
// 	client.Login(context.Background(), &api.LoginRequest{
// 		Email:    user.Email,
// 		Password: "hello1234",
// 	})
// 	project := initProject("project-test", client, t)
// 	cc := initProjectCandidate(project.ID, OIDCAuthWithoutData, client, t)
// 	cluster := initProjectCluster(project.ID, cc.ID, client, t)

// 	resp, err := client.GetProjectCluster(context.Background(), project.ID, cluster.ID)

// 	if err != nil {
// 		t.Fatalf("%v\n", err)
// 	}

// 	// ensure project id and metadata is correct
// 	if resp.ProjectID != project.ID {
// 		t.Errorf("project id incorrect: expected %d, got %d\n", project.ID, resp.ProjectID)
// 	}

// 	// verify clusters
// 	if resp.Name != "cluster-test" {
// 		t.Errorf("cluster's name is incorrect: expected %s, got %s\n", "cluster-test", resp.Name)
// 	}

// 	if resp.Server != "https://10.10.10.10" {
// 		t.Errorf("cluster's server is incorrect: expected %s, got %s\n", "https://10.10.10.10", resp.Server)
// 	}
// }

// func TestCreateProjectCandidates(t *testing.T) {
// 	email := "create_project_candidates_test@example.com"
// 	client := api.NewClient(baseURL, "cookie_create_project_candidates_test.json")
// 	user := initUser(email, client, t)
// 	client.Login(context.Background(), &api.LoginRequest{
// 		Email:    user.Email,
// 		Password: "hello1234",
// 	})
// 	project := initProject("project-test", client, t)

// 	resp, err := client.CreateProjectCandidates(
// 		context.Background(),
// 		project.ID,
// 		&api.CreateProjectCandidatesRequest{
// 			Kubeconfig: OIDCAuthWithoutData,
// 		},
// 	)

// 	if err != nil {
// 		t.Fatalf("%v\n", err)
// 	}

// 	// make sure length is 1
// 	if len(resp) != 1 {
// 		t.Fatalf("candidates length is not 1\n")
// 	}

// 	// make sure auth mechanism is OIDC, project id is correct, and cluster info is correct
// 	if resp[0].ProjectID != project.ID {
// 		t.Errorf("project id incorrect: expected %d, got %d\n", project.ID, resp[0].ProjectID)
// 	}

// 	if resp[0].Name != "cluster-test" {
// 		t.Errorf("cluster name incorrect: expected %s, got %s\n", "cluster-test", resp[0].Name)
// 	}

// 	if resp[0].Server != "https://10.10.10.10" {
// 		t.Errorf("cluster endpoint incorrect: expected %s, got %s\n", "https://10.10.10.10", resp[0].Server)
// 	}

// 	// make sure correct resolvers need to be performed
// 	if len(resp[0].Resolvers) != 1 {
// 		t.Fatalf("actions length is not 1\n")
// 	}
// }

// func TestGetProjectCandidates(t *testing.T) {
// 	email := "get_project_candidates_test@example.com"
// 	client := api.NewClient(baseURL, "cookie_get_project_candidates_test.json")
// 	user := initUser(email, client, t)
// 	client.Login(context.Background(), &api.LoginRequest{
// 		Email:    user.Email,
// 		Password: "hello1234",
// 	})
// 	project := initProject("project-test", client, t)
// 	initProjectCandidate(project.ID, OIDCAuthWithoutData, client, t)

// 	resp, err := client.GetProjectCandidates(context.Background(), project.ID)

// 	if err != nil {
// 		t.Fatalf("%v\n", err)
// 	}

// 	// make sure length is 1
// 	if len(resp) != 1 {
// 		t.Fatalf("candidates length is not 1\n")
// 	}

// 	// make sure auth mechanism is OIDC, project id is correct, and cluster info is correct
// 	// if resp[0].Integration != models.OIDC {
// 	// 	t.Errorf("oidc auth mechanism incorrect: expected %s, got %s\n", models.OIDC, resp[0].Integration)
// 	// }

// 	// if resp[0].ProjectID != project.ID {
// 	// 	t.Errorf("project id incorrect: expected %d, got %d\n", project.ID, resp[0].ProjectID)
// 	// }

// 	// if resp[0].ClusterName != "cluster-test" {
// 	// 	t.Errorf("cluster name incorrect: expected %s, got %s\n", "cluster-test", resp[0].ClusterName)
// 	// }

// 	// if resp[0].ClusterEndpoint != "https://10.10.10.10" {
// 	// 	t.Errorf("cluster endpoint incorrect: expected %s, got %s\n", "https://10.10.10.10", resp[0].ClusterEndpoint)
// 	// }

// 	// // make sure correct actions need to be performed
// 	// if len(resp[0].Actions) != 1 {
// 	// 	t.Fatalf("actions length is not 1\n")
// 	// }

// 	// if resp[0].Actions[0].Name != models.OIDCIssuerDataAction {
// 	// 	t.Errorf("action name incorrect: expected %s, got %s\n", models.OIDCIssuerDataAction, resp[0].Actions[0].Name)
// 	// }

// 	// if resp[0].Actions[0].Filename != "/fake/path/to/ca.pem" {
// 	// 	t.Errorf("action filename incorrect: expected %s, got %s\n", "/fake/path/to/ca.pem", resp[0].Actions[0].Filename)
// 	// }
// }

// func TestCreateProjectServiceAccount(t *testing.T) {
// 	email := "create_project_sa_test@example.com"
// 	client := api.NewClient(baseURL, "cookie_create_project_sa_test.json")
// 	user := initUser(email, client, t)
// 	client.Login(context.Background(), &api.LoginRequest{
// 		Email:    user.Email,
// 		Password: "hello1234",
// 	})
// 	project := initProject("project-test", client, t)
// 	saCandidate := initProjectCandidate(project.ID, OIDCAuthWithoutData, client, t)

// 	resp, err := client.CreateProjectCluster(
// 		context.Background(),
// 		project.ID,
// 		saCandidate.ID,
// 		&models.ClusterResolverAll{
// 			OIDCIssuerCAData: "LS0tLS1CRUdJTiBDRVJ=",
// 		},
// 	)

// 	if err != nil {
// 		t.Fatalf("%v\n", err)
// 	}

// 	// ensure project id and metadata is correct
// 	if resp.ProjectID != project.ID {
// 		t.Errorf("project id incorrect: expected %d, got %d\n", project.ID, resp.ProjectID)
// 	}

// 	// if resp.Kind != "connector" {
// 	// 	t.Errorf("service account kind incorrect: expected %s, got %s\n", "connector", resp.Kind)
// 	// }

// 	// if resp.Integration != models.OIDC {
// 	// 	t.Errorf("service account auth mechanism incorrect: expected %s, got %s\n", models.OIDC, resp.Integration)
// 	// }

// 	// // verify clusters
// 	// if len(resp.Clusters) != 1 {
// 	// 	t.Fatalf("length of clusters is not 1")
// 	// }

// 	// if resp.Clusters[0].ServiceAccountID != resp.ID {
// 	// 	t.Errorf("cluster's sa id is incorrect: expected %d, got %d\n", resp.ID, resp.Clusters[0].ServiceAccountID)
// 	// }

// 	// if resp.Clusters[0].Name != "cluster-test" {
// 	// 	t.Errorf("cluster's name is incorrect: expected %s, got %s\n", "cluster-test", resp.Clusters[0].Name)
// 	// }

// 	// if resp.Clusters[0].Server != "https://10.10.10.10" {
// 	// 	t.Errorf("cluster's name is incorrect: expected %s, got %s\n", "https://10.10.10.10", resp.Clusters[0].Server)
// 	// }
// }

// func TestListProjectClusters(t *testing.T) {
// 	email := "list_project_clusters_test@example.com"
// 	client := api.NewClient(baseURL, "cookie_list_project_clusters_test.json")
// 	user := initUser(email, client, t)
// 	client.Login(context.Background(), &api.LoginRequest{
// 		Email:    user.Email,
// 		Password: "hello1234",
// 	})
// 	project := initProject("project-test", client, t)
// 	cc := initProjectCandidate(project.ID, OIDCAuthWithoutData, client, t)
// 	initProjectCluster(project.ID, cc.ID, client, t)

// 	resp, err := client.ListProjectClusters(
// 		context.Background(),
// 		project.ID,
// 	)

// 	if err != nil {
// 		t.Fatalf("%v\n", err)
// 	}

// 	// verify clusters
// 	if len(resp) != 1 {
// 		t.Fatalf("length of clusters is not 1")
// 	}

// 	if resp[0].Name != "cluster-test" {
// 		t.Errorf("cluster's name is incorrect: expected %s, got %s\n", "cluster-test", resp[0].Name)
// 	}

// 	if resp[0].Server != "https://10.10.10.10" {
// 		t.Errorf("cluster's name is incorrect: expected %s, got %s\n", "https://10.10.10.10", resp[0].Server)
// 	}
// }

// func TestDeleteProject(t *testing.T) {
// 	email := "delete_project_test@example.com"
// 	client := api.NewClient(baseURL, "cookie_delete_project_test.json")
// 	user := initUser(email, client, t)
// 	client.Login(context.Background(), &api.LoginRequest{
// 		Email:    user.Email,
// 		Password: "hello1234",
// 	})
// 	project := initProject("project-test", client, t)

// 	resp, err := client.DeleteProject(context.Background(), project.ID)

// 	if err != nil {
// 		t.Fatalf("%v\n", err)
// 	}

// 	// make sure user is admin and project name is correct
// 	if resp.Name != "project-test" {
// 		t.Errorf("project name incorrect: expected %s, got %s\n", "project-test", resp.Name)
// 	}

// 	if len(resp.Roles) != 1 {
// 		t.Fatalf("project role length is not 1")
// 	}

// 	if resp.Roles[0].Kind != models.RoleAdmin {
// 		t.Errorf("project role kind is incorrect: expected %s, got %s\n", models.RoleAdmin, resp.Roles[0].Kind)
// 	}

// 	if resp.Roles[0].UserID != user.ID {
// 		t.Errorf("project role user_id is incorrect: expected %d, got %d\n", user.ID, resp.Roles[0].UserID)
// 	}

// 	// make sure that project can no longer be found
// 	_, err = client.GetProject(context.Background(), project.ID)

// 	if err == nil {
// 		t.Fatalf("no error returned\n")
// 	}
// }

// const OIDCAuthWithoutData string = `
// apiVersion: v1
// clusters:
// - cluster:
//     server: https://10.10.10.10
//     certificate-authority-data: LS0tLS1CRUdJTiBDRVJ=
//   name: cluster-test
// contexts:
// - context:
//     cluster: cluster-test
//     user: test-admin
//   name: context-test
// current-context: context-test
// kind: Config
// preferences: {}
// users:
// - name: test-admin
//   user:
//     auth-provider:
//       config:
//         client-id: porter-api
//         id-token: token
//         idp-issuer-url: https://10.10.10.10
//         idp-certificate-authority: /fake/path/to/ca.pem
//       name: oidc
// `
