package gorm

import (
	"github.com/porter-dev/porter/internal/models"
	"github.com/porter-dev/porter/internal/repository"
	"gorm.io/gorm"
)

// ProjectRepository uses gorm.DB for querying the database
type ProjectRepository struct {
	db *gorm.DB
}

// NewProjectRepository returns a ProjectRepository which uses
// gorm.DB for querying the database
func NewProjectRepository(db *gorm.DB) repository.ProjectRepository {
	return &ProjectRepository{db}
}

// CreateProject creates a new project
func (repo *ProjectRepository) CreateProject(project *models.Project) (*models.Project, error) {
	if err := repo.db.Create(project).Error; err != nil {
		return nil, err
	}

	return project, nil
}

// CreateProjectRole appends a role to the existing array of roles
func (repo *ProjectRepository) CreateProjectRole(project *models.Project, role *models.Role) (*models.Role, error) {
	assoc := repo.db.Model(&project).Association("Roles")

	if assoc.Error != nil {
		return nil, assoc.Error
	}

	if err := assoc.Append(role); err != nil {
		return nil, err
	}

	return role, nil
}

// ReadProject gets a projects specified by a unique id
func (repo *ProjectRepository) ReadProject(id uint) (*models.Project, error) {
	project := &models.Project{}

	if err := repo.db.Preload("Roles").Where("id = ?", id).First(&project).Error; err != nil {
		return nil, err
	}

	return project, nil
}

// ReadProjectRole gets a role for a project specified by a user and project ID
func (repo *ProjectRepository) ReadProjectRole(userID, projID uint) (*models.Role, error) {
	role := &models.Role{}

	if err := repo.db.Where("user_id = ? AND project_id = ?", userID, projID).First(&role).Error; err != nil {
		return nil, err
	}

	return role, nil
}

// ListProjectsByUserID lists projects where a user has an associated role
func (repo *ProjectRepository) ListProjectsByUserID(userID uint) ([]*models.Project, error) {
	projects := make([]*models.Project, 0)

	subQuery := repo.db.Model(&models.Role{}).Where("user_id = ?", userID).Select("project_id")

	if err := repo.db.Preload("Roles").Model(&models.Project{}).Where("id IN (?)", subQuery).Find(&projects).Error; err != nil {
		return nil, err
	}

	return projects, nil
}

// DeleteProject deletes a project (marking deleted in the db)
func (repo *ProjectRepository) DeleteProject(project *models.Project) (*models.Project, error) {
	if err := repo.db.Delete(&project).Error; err != nil {
		return nil, err
	}
	return project, nil
}
