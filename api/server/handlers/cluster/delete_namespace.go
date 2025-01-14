package cluster

import (
	"net/http"

	"github.com/porter-dev/porter/api/server/authz"
	"github.com/porter-dev/porter/api/server/handlers"
	"github.com/porter-dev/porter/api/server/shared"
	"github.com/porter-dev/porter/api/server/shared/apierrors"
	"github.com/porter-dev/porter/api/server/shared/config"
	"github.com/porter-dev/porter/api/server/shared/requestutils"
	"github.com/porter-dev/porter/api/types"
	"github.com/porter-dev/porter/internal/models"
)

type DeleteNamespaceHandler struct {
	handlers.PorterHandlerReader
	authz.KubernetesAgentGetter
}

func NewDeleteNamespaceHandler(
	config *config.Config,
	decoderValidator shared.RequestDecoderValidator,
) *DeleteNamespaceHandler {
	return &DeleteNamespaceHandler{
		PorterHandlerReader:   handlers.NewDefaultPorterHandler(config, decoderValidator, nil),
		KubernetesAgentGetter: authz.NewOutOfClusterAgentGetter(config),
	}
}

func (c *DeleteNamespaceHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	namespace, _ := requestutils.GetURLParamString(r, types.URLParamNamespace)

	if namespace == "" {
		request := &types.DeleteNamespaceRequest{}

		if ok := c.DecodeAndValidate(w, r, request); !ok {
			return
		}

		namespace = request.Name
	}

	cluster, _ := r.Context().Value(types.ClusterScope).(*models.Cluster)

	agent, err := c.GetAgent(r, cluster, "")

	if err != nil {
		c.HandleAPIError(w, r, apierrors.NewErrInternal(err))
		return
	}

	if err := agent.DeleteNamespace(namespace); err != nil {
		c.HandleAPIError(w, r, apierrors.NewErrInternal(err))
		return
	}

	w.WriteHeader(http.StatusOK)
}
