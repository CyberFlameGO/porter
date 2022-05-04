import React, { useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Tooltip } from "@material-ui/core";
import Modal from "main/home/modals/Modal";
import { TwitterPicker } from "react-color";
import InputRow from "components/form-components/InputRow";
import SaveButton from "components/SaveButton";
import api from "shared/api";
import { Context } from "shared/Context";
import { ChartType } from "shared/types";
import Helper from "components/form-components/Helper";
import { differenceBy } from "lodash";
import SearchSelector from "components/SearchSelector";

type Props = {
  onSave: ((values: any[]) => void) | ((values: any[]) => Promise<void>);
  release: ChartType;
};

const TagSelector = ({ onSave, release }: Props) => {
  const { currentProject, currentCluster, setCurrentError } = useContext(
    Context
  );
  const [values, setValues] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [buttonStatus, setButtonStatus] = useState("");

  const onDelete = (index: number) => {
    setValues((prev) => {
      const newValues = [...prev];
      const removedTag = newValues.splice(index, 1);
      setAvailableTags((prevAt) => [...prevAt, ...removedTag]);
      return newValues;
    });
  };

  const handleSave = async () => {
    setButtonStatus("loading");

    try {
      await api.updateReleaseTags(
        "<token>",
        { tags: [...values.map((tag) => tag.name)] },
        {
          project_id: currentProject.id,
          cluster_id: currentCluster.id,
          namespace: release.namespace,
          release_name: release.name,
        }
      );
      await onSave(values);
      setButtonStatus("successful");
    } catch (error) {
      console.log(error);
      setCurrentError(
        "We couldn't link the tag to the release, please try again."
      );
      setButtonStatus("Couldn't link the tag to the release");
      return;
    } finally {
      setTimeout(() => {
        setButtonStatus("");
      }, 800);
    }
  };

  useEffect(() => {
    api
      .getTagsByProjectId<any[]>(
        "<token>",
        {},
        { project_id: currentProject.id }
      )
      .then(({ data }) => {
        const releaseTags = data.filter((tag) =>
          release.tags?.includes(tag.name)
        );
        const tmpAvailableTags = differenceBy(data, releaseTags, "name");

        setValues(releaseTags);
        setAvailableTags(tmpAvailableTags);
      });
  }, [currentProject]);

  const hasUnsavedChanges = useMemo(() => {
    const hasAddedSomething = !!differenceBy(
      values,
      release.tags?.map((tagName: string) => ({ name: tagName })) || [],
      "name"
    ).length;

    const hasDeletedSomething = !!differenceBy(
      release.tags?.map((tagName: string) => ({ name: tagName })) || [],
      values,
      "name"
    ).length;

    return hasAddedSomething || hasDeletedSomething;
  }, [values, release]);

  return (
    <>
      {openModal ? (
        <CreateTagModal
          onSave={(newTag) =>
            setValues((prev) => {
              const newValues = [...prev, newTag];
              onSave(newValues);
              return newValues;
            })
          }
          onClose={() => setOpenModal(false)}
          release={release}
        />
      ) : null}

      <Flex>
        <SearchSelector
          options={availableTags}
          dropdownLabel="Select a tag"
          filterBy="name"
          onSelect={(value) => {
            console.log(value);
            setAvailableTags((prev) =>
              prev.filter((prevVal) => prevVal.name !== value.name)
            );
            setValues((prev) => [...prev, value]);
          }}
          getOptionLabel={(option) => option.name}
          renderOptionIcon={(option) => <TagColorBox color={option.color} />}
        ></SearchSelector>
        <Tooltip title="Create a new tag">
          <AddButton
            className="material-icons-outlined"
            onClick={() => setOpenModal((prev) => !prev)}
          >
            add
          </AddButton>
        </Tooltip>
      </Flex>
      {values.map((val, index) => {
        return (
          <Tag color={val.color} key={index}>
            <Tooltip title={val.name}>
              <TagText>{val.name}</TagText>
            </Tooltip>
            <i className="material-icons" onClick={() => onDelete(index)}>
              delete
            </i>
          </Tag>
        );
      })}
      <Flex
        style={{
          marginTop: "35px",
        }}
      >
        <SaveButton
          helper={hasUnsavedChanges ? "Unsaved changes" : ""}
          clearPosition
          statusPosition="right"
          text="Save changes"
          onClick={() => handleSave()}
          status={buttonStatus}
          disabled={!hasUnsavedChanges || buttonStatus === "loading"}
        ></SaveButton>
      </Flex>
    </>
  );
};

const CreateTagModal = ({
  onSave,
  onClose,
  release,
}: {
  onSave: (tag: any) => void;
  onClose: () => void;
  release: ChartType;
}) => {
  const { currentCluster, currentProject, setCurrentError } = useContext(
    Context
  );

  const [color, setColor] = useState("#ffffff");
  const [name, setName] = useState("some-random-tag");

  const [buttonStatus, setButtonStatus] = useState("");

  const createTag = async () => {
    setButtonStatus("loading");
    try {
      await api.createTag(
        "<token>",
        { name, color },
        {
          project_id: currentProject.id,
        }
      );
    } catch (error) {
      setCurrentError(error);
      setButtonStatus("Couldn't create the tag");
      return;
    }

    try {
      await api.updateReleaseTags(
        "<token>",
        { tags: [...(release.tags || []), name] },
        {
          project_id: currentProject.id,
          cluster_id: currentCluster.id,
          namespace: release.namespace,
          release_name: release.name,
        }
      );
      setButtonStatus("successful");
      onSave({ name, color });
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (error) {
      console.log(error);
      setCurrentError(
        "We couldn't link the tag to the release, please link it manually from the settings tab."
      );
      setButtonStatus("Couldn't link the tag to the release");
      return;
    }
  };

  return (
    <Modal title="Create a new tag" onRequestClose={onClose} height="auto">
      <Helper>
        Create a new tag and link the release you're currently at to the brand
        new tag.
      </Helper>

      <InputRow
        type="text"
        label="Tag name"
        value={name}
        setValue={(val) => setName(val as string)}
        isRequired
        width="300px"
      ></InputRow>
      <Label>Tag color</Label>
      <TwitterPicker
        triangle="hide"
        color={color}
        onChange={(newColor) => setColor(newColor.hex)}
      ></TwitterPicker>

      <Label style={{ marginTop: "15px" }}>Result</Label>
      <Tag color={color} style={{ maxWidth: "none", marginTop: "0px" }}>
        <TagText>{name}</TagText>
      </Tag>
      <Flex
        style={{
          justifyContent: "flex-end",
        }}
      >
        <SaveButton
          clearPosition
          onClick={() => createTag()}
          text={"Create Tag"}
          disabled={!name.length || buttonStatus === "loading"}
        ></SaveButton>
      </Flex>
    </Modal>
  );
};

export default TagSelector;

const Flex = styled.div`
  display: flex;
`;

const AddButton = styled.div`
  border-radius: 50%;
  border: 1px solid #ffffff11;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  background: #ffffff11;
  color: #ffffff88;
  :hover {
    background: #ffffff22;
    color: #ffffff;
    cursor: pointer;
  }
`;

const Tag = styled.div<{ color: string }>`
  display: inline-flex;
  color: ${(props) => props.color || "inherit"};
  user-select: none;
  border: 1px solid black;
  border-radius: 15px;
  padding: 5px 10px;
  text-align: center;
  align-items: center;
  font-size: 14px;
  background-color: ${(props) => props.color || "inherit"};
  margin-top: 15px;
  margin-bottom: 5px;

  max-width: 150px;
  min-height: 30px;
  min-width: 60px;

  :not(:last-child) {
    margin-right: 10px;
  }

  > .material-icons {
    font-size: 20px;
    margin-left: 5px;
    mix-blend-mode: difference;
    :hover {
      cursor: pointer;
    }
  }
`;

const TagText = styled.span`
  mix-blend-mode: difference;

  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Label = styled.div`
  color: #ffffff;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  font-size: 13px;
  font-family: "Work Sans", sans-serif;
`;

const TagColorBox = styled.div`
  width: 20px;
  height: 20px;
  margin-right: 5px;
  border-radius: 5px;
  background-color: ${(props: { color: string }) => props.color};
`;