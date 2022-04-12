package models

import (
	"gorm.io/gorm"
)

// Tag model used to group releases.

// Tag type that extends gorm.Model
type Tag struct {
	gorm.Model

	ProjectID uint       `json:"project_id" gorm:"primaryKey;autoIncrement:false"`
	Name      string     `json:"name" gorm:"primaryKey"`
	Color     string     `json:"color"`
	Releases  []*Release `json:"releases" gorm:"many2many:release_tags"`
}
