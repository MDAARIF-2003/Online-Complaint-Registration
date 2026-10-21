import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

export const ComplaintFilterBar = ({
  search,
  setSearch,
  status,
  setStatus,
  priority,
  setPriority,
  category,
  setCategory,
  categories = [],
  onReset,
}) => {
  return (
    <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
      <div className="card-body p-3">
        <div className="row g-2 align-items-center">
          {/* Search */}
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0 ps-0"
                placeholder="Search reference # or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select bg-light text-dark"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Reopened">Reopened</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select bg-light text-dark"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="col-8 col-md-3">
            <select
              className="form-select bg-light text-dark"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <div className="col-4 col-md-1 text-end">
            <button
              className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center p-2"
              onClick={onReset}
              title="Reset Filters"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintFilterBar;
