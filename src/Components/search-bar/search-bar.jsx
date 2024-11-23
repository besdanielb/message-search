import SearchInput from "./search-input";
import SearchTypeRadioButtons from "../search-type-buttons/search-type-radio-buttons";
import "./search-bar.scss";

export default function SearchBar({
  searchTerm,
  onSearch,
  onSearchInputValueChange,
  onClearInput,
  searchType,
  onSearchTypeChange,
}) {
  return (
    <div className="search-bar-container">
      <SearchInput
        onSearch={onSearch}
        onSearchInputValueChange={onSearchInputValueChange}
        onClearInput={onClearInput}
        searchTerm={searchTerm}
        aria-label="search input"
        searchBook="Message"
      />
      <SearchTypeRadioButtons
        searchType={searchType}
        onSearchTypeChange={onSearchTypeChange}
      />
    </div>
  );
}
