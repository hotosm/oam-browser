import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import ConfirmDeleteLink from "../../src/components/confirm_delete_link";

describe("ConfirmDeleteLink", () => {
  it("renders 'Delete' link by default", () => {
    const wrapper = shallow(<ConfirmDeleteLink deleteImage={() => {}} />);
    const a = wrapper.find("a");
    expect(a).to.have.length(1);
    expect(a.text()).to.equal("Delete");
  });

  it("updates links to Confirm and Cancel after 'Delete' is clicked", () => {
    const wrapper = shallow(<ConfirmDeleteLink deleteImage={() => {}} />);
    const deleteLink = wrapper.find("a");
    deleteLink.simulate("click");
    const confirmDelete = wrapper.find("a").first();
    const cancelDelete = wrapper.find("a").at(1);
    expect(confirmDelete.text()).to.equal("Click To Confirm Delete");
    expect(cancelDelete.text()).to.equal("Cancel Delete");
  });

  it("calls the deleteImage prop function when Confirm is clicked", () => {
    const deleteImage = sinon.spy();
    const wrapper = shallow(<ConfirmDeleteLink deleteImage={deleteImage} />);
    const deleteLink = wrapper.find("a");
    deleteLink.simulate("click");
    const confirmDelete = wrapper.find("a").first();
    confirmDelete.simulate("click");
    expect(deleteImage).to.have.property("callCount", 1);
  });
});
